import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END, StreamMode } from '@langchain/langgraph';
import { Response } from 'express';
import { IsRelevant } from '../../decorators';
import { createMainSupervisorAgent, documentationAgent } from '../../agents';
import { MainGraphStateType } from './types';
import { RunnableLambda } from '@langchain/core/runnables';
import { AnalyticsSubGraph } from '../analytics_sub_graph';

/**
 * The `AgentWorkflow` class is responsible for managing the workflow of an agent.
 * It initializes with user input, a thread ID, and an HTTP response object.
 * The class sets up Server-Sent Events (SSE) headers for the response and provides
 * a method to stream graph events back to the client.
 *
 * @class
 * @param {string} userInput - The input provided by the user.
 * @param {string} threadId - The unique identifier for the thread.
 * @param {Response} response - The HTTP response object.
 *
 * @property {Object} options - Configuration options for the workflow.
 * @property {number} options.recursionLimit - The limit for recursion.
 * @property {'v1' | 'v2'} options.version - The version of the workflow.
 * @property {BaseMessage[]} messages - The list of messages in the workflow.
 * @property {string} threadId - The unique identifier for the thread.
 * @property {Response} response - The HTTP response object.
 *
 * @method streamGraph
 * @description Creates and compiles a StateGraph with nodes and edges,
 * then streams events from the graph, logging each event and eventually ending the response.
 * @returns {Promise<void>} A promise that resolves when the streaming is complete.
 */
export class MainGraph {
	private readonly options = { recursionLimit: 15, streamMode: 'updates' as StreamMode };
	private messages: BaseMessage[] = [];

	private userInput: string;
	private threadId: string;
	private response: Response;
	private merchantId: number;
	private userId: number;

	private GraphState: MainGraphStateType;

	constructor(userInput: string, threadId: string, response: Response, merchantId: number, userId: number) {
		this.messages = [new HumanMessage(userInput)];

		this.threadId = threadId;
		this.response = response;
		this.userInput = userInput;
		this.merchantId = merchantId;
		this.userId = userId;

		// Set SSE headers
		this.response.setHeader('Content-Type', 'text/event-stream');
		this.response.setHeader('Cache-Control', 'no-cache');
		this.response.setHeader('Connection', 'keep-alive');

		// Initialize GraphState
		this.GraphState = Annotation.Root({
			merchant_id: Annotation<number>,
			user_id: Annotation<number>,
			messages: Annotation<BaseMessage[]>({
				reducer: (x, y) => x.concat(y),
				default: () => []
			}),
			next: Annotation({
				// The routing key; defaults to END if not set
				reducer: (state, update) => update ?? state ?? END,
				default: () => END
			}),
			instructions: Annotation<string>({
				reducer: (x, y) => y ?? x,
				default: () => "Resolve the user's request."
			})
		});
	}

	@IsRelevant
	public async streamGraph(): Promise<void> {
		// Create main graph supervisor
		const mainSupervisorAgent = await createMainSupervisorAgent();

		// Create analytics chain
		const analyticsSubGraph = new AnalyticsSubGraph(this.userInput, this.threadId, this.merchantId, this.userId);
		const analyticsChain = await analyticsSubGraph.createAnalyticsChain();

		// Create lambdas
		const getMessages = RunnableLambda.from((state: MainGraphStateType['State']) => {
			return { messages: state.messages };
		});

		const joinGraph = RunnableLambda.from((response: any) => {
			return {
				messages: [response.messages[response.messages.length - 1]]
			};
		});

		// Create and compile the graph
		const mainGraph = new StateGraph(this.GraphState)
			.addNode('AnalyticsTeam', getMessages.pipe(analyticsChain).pipe(joinGraph))
			.addNode('DocumentationAgent', documentationAgent)
			.addNode('MainSupervisor', mainSupervisorAgent)
			.addEdge(START, 'MainSupervisor')
			.addEdge('AnalyticsTeam', 'MainSupervisor')
			.addEdge('DocumentationAgent', 'MainSupervisor')
			.addConditionalEdges('MainSupervisor', (x: any) => x.next, {
				AnalyticsTeam: 'AnalyticsTeam',
				DocumentationAgent: 'DocumentationAgent',
				FINISH: END
			})
			.addEdge(START, 'MainSupervisor')
			.compile();

		const stream = mainGraph.stream(
			{
				messages: this.messages,
				merchant_id: this.merchantId,
				user_id: this.userId
			},
			this.options
		);

		// Extract graph events and stream them back
		for await (const chunk of await stream) {
			for (const [node, values] of Object.entries(chunk)) {
				console.log(`Receiving update from node: ${node}`);
				console.log(values);
				console.log('\n====\n');
			}
		}
		this.response.end();
	}
}
