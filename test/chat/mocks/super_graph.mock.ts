import { BaseMessage } from '@langchain/core/messages';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { IRRELEVANT_MSG, MOCK_RES_REQ } from '../../constants/test.constants';

// Mock class implementation for SuperGraph.
export class SuperGraphMock {
	public static threadId: string = uuidv4();
	public static STATE = {
		conversation_messages: [] as BaseMessage[],
		user_id: undefined,
		merchant_id: undefined
	} as { conversation_messages: BaseMessage[]; user_id?: number; merchant_id?: number };

	public async streamGraph(
		response: Response,
		userInput: string,
		merchantId: number,
		userId: number,
		threadId: string = SuperGraphMock.threadId
	) {
		const words = MOCK_RES_REQ[userInput].split(' ');

		response.setHeader('Content-Type', 'text/event-stream');
		response.setHeader('Cache-Control', 'no-cache');
		response.setHeader('Connection', 'keep-alive');

		for (const word of words) {
			// Write SSE headers and data.
			response.write(`id: ${threadId}\n`);
			response.write(`event: Response\n`);
			response.write(`data: ${word} \n\n`);
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		// Append messages to the state.
		SuperGraphMock.STATE.conversation_messages = SuperGraphMock.STATE.conversation_messages.concat([
			{ content: userInput },
			{
				content: MOCK_RES_REQ[userInput],
				name: userInput !== IRRELEVANT_MSG ? 'Composer' : 'SemanticRouter'
			}
		] as BaseMessage[]);

		SuperGraphMock.STATE.user_id = userId;
		SuperGraphMock.STATE.merchant_id = merchantId;

		response.end();
	}

	public async getConversationMessages(threadId: string, userId: number, merchantId: number) {
		if (
			threadId === SuperGraphMock.threadId &&
			userId === SuperGraphMock.STATE.user_id &&
			merchantId === SuperGraphMock.STATE.merchant_id
		) {
			return SuperGraphMock.STATE.conversation_messages;
		}

		// Wrong values/non-existent threadId returns empty list.
		else {
			return [];
		}
	}
}

export const workflowMock = new SuperGraphMock();
