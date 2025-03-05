import { BaseMessage } from '@langchain/core/messages';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { ERRORS } from '../../../app/common';
import { workflow } from '../../../app/services/workflow/graphs/super_graph';
import { ADDITIONAL_MSG, INITIAL_MSG, IRRELEVANT_MSG, MOCK_RES_REQ } from '../../constants/test.constants';
import { workflowMock } from '../mocks/super_graph.mock';
import { ChatHttpClient } from './chat-api-http-client';

/**
 * The main idea here is to test the ChatController class.
 * We will mock the workflow.streamGraph and workflow.getConversationMessages methods.
 * We will try to follow 2 narratives:
 *    1. unauthorized user tries to access the chat endpoints.
 *    2. authorized user tries to access the chat endpoints and track it's thread messages.
 */
describe('Chat Controller', () => {
	let threadId: string;
	let client: ChatHttpClient;

	beforeEach(async () => {
		client = await new ChatHttpClient().init({ userId: 10267117, merchantId: 2288 });
		sinon.stub(workflow, 'streamGraph').callsFake(workflowMock.streamGraph);
		sinon.stub(workflow, 'getConversationMessages').callsFake(workflowMock.getConversationMessages);
	});

	describe('UNAUTHORIZED', () => {
		it('POST /chat should return 401 Unauthorized', async () => {
			const res = await client.removeAuth().newChat({ initialMessage: INITIAL_MSG });

			expect(res.status).equals(401);
		});

		it('POST /chat/:threadId should return 401 Unauthorized', async () => {
			const res = await client.removeAuth().continueChat('fake-thread-id', { message: ADDITIONAL_MSG });

			expect(res.status).equals(401);
		});

		it('GET /chat/:threadId should return 401 Unauthorized', async () => {
			const res = await client.removeAuth().getChatByThreadId('fake-thread-id');

			expect(res.status).equals(401);
		});

		it('POST /chat should return 401 Unauthorized', async () => {
			const res = await client
				.switchIdentity({ merchantId: 1, userId: undefined as unknown as number })
				.newChat({ initialMessage: INITIAL_MSG });

			const error = res.data as unknown as { title?: string };

			expect(res.status).equals(401);
			expect(error?.title).equals('Missing user id');
		});
	});

	describe('AUTHORIZED', () => {
		it('POST /chat should create a new chat and return an SSE message', async () => {
			// Send the request
			const res = await client.newChat({ initialMessage: INITIAL_MSG });

			expect(res.status).equals(200);
			expect(res.data).includes('Yahav');
			expect(res.headers['content-type']).equals('text/event-stream');
			expect(workflow.streamGraph).to.have.been.called;

			// Extract the thread id from the response
			const data = res.data as unknown as string;

			threadId = data.split('\n')[0].split(' ')[1];
		});

		it('POST /chat/:threadId should append a message and return an SSE message', async () => {
			// Send the request
			const res = await client.continueChat(threadId, { message: ADDITIONAL_MSG });

			expect(res.status).equals(200);
			expect(res.data).includes('11,025');
			expect(res.headers['content-type']).equals('text/event-stream');
			expect(workflow.streamGraph).to.have.been.called;

			const data = res.data as unknown as string;

			// Check that it's the same threadId.
			const resThreadId = data.split('\n')[0].split(' ')[1];

			expect(resThreadId).equals(threadId);
		});

		it('POST /chat/:threadId should result in an error message but status 200 because of irrelevant message', async () => {
			// Send the request
			const res = await client.continueChat(threadId, { message: IRRELEVANT_MSG });

			expect(res.status).equals(200);
			expect(res.headers['content-type']).equals('text/event-stream');

			const data = res.data as unknown as string;

			// Check that it's the same threadId.
			const resThreadId = data.split('\n')[0].split(' ')[1];

			expect(resThreadId).equals(threadId);
		});

		it('GET /chat/:threadId should return an array of chat messages from a given thread', async () => {
			// Prepare a sample chat history.
			const chatHistory = [
				{ content: INITIAL_MSG },
				{ content: MOCK_RES_REQ[INITIAL_MSG], name: 'Composer' },
				{ content: ADDITIONAL_MSG },
				{ content: MOCK_RES_REQ[ADDITIONAL_MSG], name: 'Composer' },
				{ content: IRRELEVANT_MSG },
				{ content: ERRORS.BAD_INPUT, name: 'SemanticRouter' }
			] as BaseMessage[];

			const res = await client.getChatByThreadId(threadId);

			// Validate that the GET endpoint returns the expected array of messages.
			expect(res.data).to.deep.equal(chatHistory);
		});

		it('GET /chat/:threadId should return an empty array of chat messages from an non-existent', async () => {
			// Prepare a sample chat history.
			const chatHistory = [] as BaseMessage[];

			const res = await client.getChatByThreadId(`fake-thread-id`);

			// Validate that the GET endpoint returns the expected array of messages.
			expect(res.data).to.deep.equal(chatHistory);
		});
	});
});
