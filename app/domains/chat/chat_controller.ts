import { throwProblem } from '@bringg/service';
import { Merchant as MerchantModel } from '@bringg/service-data';
import { MessageContent } from '@langchain/core/messages';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Context, GET, Path, PathParam, QueryParam, ServiceContext } from 'typescript-rest';

import { IS_DEV, IS_TEST } from '../../common/constants';
import { conditionalSecurity } from '../../common/utils/decorator_utils';
import { validateUser } from '../../common/utils/user_validation';
import { workflow } from '../../services/workflow/graphs/super_graph';

@Path('chat')
@conditionalSecurity()
export class ChatController {
	@Context
	private context: ServiceContext;

	@GET
	@Path('/:message')
	/**
	 * GET /chat/:message?threadId=threadId
	 * Creates a new chat thread.
	 */
	public async newChatMessage(
		@PathParam('message') message: string,
		@QueryParam('threadId') threadId: string
	): Promise<void> {
		const { merchantId, userId } = validateUser(this.context);
		const time_zone = threadId ? null : await this.getMerchantTimezone(merchantId);

		const response = this.context.response as unknown as Response;

		await workflow.streamGraph(response, message, merchantId as number, userId as number, threadId, time_zone);
	}

	@Path(`/history/:threadId`)
	@GET
	/**
	 * GET /chat/history/:threadId
	 * Returns a given chat thread by threadId.
	 */
	public async getChatByThreadId(
		@PathParam('threadId') threadId: string
	): Promise<{ content: MessageContent; name?: string }[]> {
		const { merchantId, userId } = validateUser(this.context);

		const messages = await workflow.getConversationMessages(threadId, userId, merchantId);

		return messages.map(message => ({
			content: message.content,
			name: message.name,
			timestamp: message.additional_kwargs?.timestamp
		}));
	}

	private async getMerchantTimezone(merchantId: number): Promise<string> {
		// For dev purposes
		if (IS_DEV || IS_TEST) {
			return process.env.REGION?.startsWith('eu') ? 'Europe/London' : 'America/New_York';
		}

		const merchant = await MerchantModel.find(merchantId);

		if (!merchant) {
			throwProblem(StatusCodes.UNAUTHORIZED, 'Missing merchant');
		}

		return merchant.time_zone;
	}
}
