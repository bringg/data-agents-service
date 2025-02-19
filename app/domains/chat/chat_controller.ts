import { Context, GET, Path, PathParam, POST, PreProcessor, Security, ServiceContext } from 'typescript-rest';

import { throwProblem, ReqValidator } from '@bringg/service';
import { newChatRules, continueChatRules } from './validation/chat_validation';
import { StatusCodes } from 'http-status-codes';

import { ContinueChatDto, NewChatDto } from './types';
import { workflow } from '../../services/workflow/graphs/super_graph';

@Path('/chat')
// @Security('*', 'bringg-jwt')
export class ChatController {
	@Context
	public context: ServiceContext;

	@POST
	@Path('/')
	@PreProcessor(ReqValidator.validate(newChatRules))
	/**
	 * POST /chat
	 * Creates a new chat thread.
	 */
	public async newChat({ initialMessage }: NewChatDto) {
		const { merchantId, userId } = this.context.request.user || {};

		// if (!userId || !merchantId) {
		// 	throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		// }

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
	public async continueChat(@PathParam('threadId') threadId: string, { message }: ContinueChatDto) {
		const { merchantId, userId } = this.context.request.user || {};

		// if (!userId || !merchantId) {
		// 	throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		// }

		await workflow.streamGraph(this.context.response, message, merchantId as number, userId as number, threadId);
	}
}
