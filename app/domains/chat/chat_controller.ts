import { Context, GET, Path, PathParam, POST, PreProcessor, Security, ServiceContext } from 'typescript-rest';

import { throwProblem, ReqValidator } from '@bringg/service';
import { newChatRules, continueChatRules } from './validation/chat_validation';
import { StatusCodes } from 'http-status-codes';

import { v4 as uuidv4 } from 'uuid';
import { ContinueChatDto, NewChatDto } from './types';
import { AgentWorkflow } from '../../services/workflow/graph/graph';

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
	 * Creates a new chat thread with a unique ID and the current user ID.
	 */
	public async newChat({ initialMessage }: NewChatDto) {
		const userId = this.context.request.user?.userId;

		// if (!userId) {
		// 	throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
		// }

		const threadId = uuidv4();

		//TODO - store in redis for POC [userId : {threadId, initialMessage}]
		//TODO - store in pg for long-term

		const agentWorkflow = new AgentWorkflow(initialMessage, threadId, this.context.response);
		await agentWorkflow.streamGraph();
	}

	@Path(`/:threadId`)
	@POST
	@PreProcessor(ReqValidator.validate(continueChatRules))
	/**
	 * POST /chat/:id
	 * Continues a given chat thread by:
	 *  - Retrieving existing messages
	 *  - Running them + the new message through the graph
	 *  - Storing the new user message and the LLM response
	 *  - Returning the latest response
	 */
	public async continueChat(@PathParam('threadId') threadId: string, { message }: ContinueChatDto) {
		//     const userId = this.context.request.user?.userId;
		//     // 1) Retrieve existing conversation
		//     const existingMessages = await db.getChatMessages(threadId);
		//     const conversationText = existingMessages.map((m) => m.message).join('\n');
		//     // 2) Combine with the new user message
		//     const fullInput = `${conversationText}\nUser: ${message}`;
		//     // 3) Start the graph from greetNode
		//     //    We pass the combined text in. The result will come from openAiNode at the end.
		//     const result = await graph.start(fullInput, greetNode);
		//     // 4) Store the user's message
		//     await db.insertChatMessage(threadId, userId, message, 'user');
		//     // 5) Store the system/LLM response
		//     await db.insertChatMessage(threadId, null, result, 'system');
		//     return res.json({ response: result });
		//   } catch (error) {
		//     console.error('Error continuing chat:', error);
		//     return res.status(500).json({ error: error.message });
		//   }
	}
}
