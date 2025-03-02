import { ReqValidator, throwProblem } from '@bringg/service';
import { BaseMessage } from '@langchain/core/messages';
import { StatusCodes } from 'http-status-codes';
import { Context, GET, Path, PathParam, POST, PreProcessor, Security, ServiceContext } from 'typescript-rest';

import { workflow } from '../../services/workflow/graphs/super_graph';
import { ContinueChatDto, NewChatDto } from './types';
import { continueChatRules, newChatRules } from './validation/chat_validation';

@Path('/chat')
@Security('*', 'bringg-jwt')
export class ChatController {
	@Context
	context: ServiceContext;

	@POST
	@Path('/')
	@PreProcessor(ReqValidator.validate(newChatRules))
	/**
	 * POST /chat
	 * Creates a new chat thread.
	 */
	public async newChat({ initialMessage }: NewChatDto): Promise<void> {
		const { merchantId, userId } = this.context.request.user || {};

		if (!userId || !merchantId) {
			throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		}

		//TODO - store in redis for POC [userId : {threadId, initialMessage}]
		//TODO - store in pg for long-term
		await workflow.streamGraph(this.context.response, initialMessage, merchantId as number, userId as number);
	}

	@Path(`/:threadId`)
	@POST
	@PreProcessor(ReqValidator.validate(continueChatRules))
	/**
	 * POST /chat/:id
	 * Continues a given chat thread by threadId.
	 */
	public async continueChat(@PathParam('threadId') threadId: string, { message }: ContinueChatDto): Promise<void> {
		const { merchantId, userId } = this.context.request.user || {};

		if (!userId || !merchantId) {
			throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		}

		await workflow.streamGraph(this.context.response, message, merchantId as number, userId as number, threadId);
	}

	@Path(`/:threadId`)
	@GET
	/**
	 * GET /chat/:id
	 * Returns a given chat thread by threadId.
	 */
	public async getChatByThreadId(@PathParam('threadId') threadId: string): Promise<BaseMessage[]> {
		const { userId, merchantId } = this.context.request.user || {};

		if (!userId || !merchantId) {
			throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		}

		return await workflow.getConversationMessages(threadId, userId as number);
	}
}
