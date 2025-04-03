import { throwProblem } from '@bringg/service';
import { MessageContent } from '@langchain/core/messages';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Context, GET, Path, PathParam, QueryParam, ServiceContext } from 'typescript-rest';

import { IS_DEV } from '../../common/constants';
import { workflow } from '../../services/workflow/graphs/super_graph';

@Path('chat')
@Security('*', 'bringg-jwt')
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
		const { merchantId, userId } = this.validateUser();
		const response = this.context.response as unknown as Response;

		await workflow.streamGraph(response, message, merchantId as number, userId as number, threadId);
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
		const { merchantId, userId } = this.validateUser();

		const messages = await workflow.getConversationMessages(threadId, userId, merchantId);

		return messages.map(message => ({
			content: message.content,
			name: message.name,
			timestamp: message.additional_kwargs?.timestamp
		}));
	}

	/**
	 * Validates the user and returns the userId and merchantId as numbers.
	 * @returns { userId: number, merchantId: number }
	 */
	private validateUser(): { userId: number; merchantId: number } {
		// For dev purposes
		if (IS_DEV) {
			return { userId: 10267117, merchantId: 2288 };
		}

		const { userId, merchantId } = this.context.request.user || {};

		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		if (!userId || !merchantId) {
			throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		}

		return { userId, merchantId };
	}
}
