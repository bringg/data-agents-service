import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END, StreamMode } from '@langchain/langgraph';
import { Response } from 'express';
import { IsRelevant } from '../decorators';
import {
	analyticsSupervisor,
	biDashboardsAgent,
	documentationAgent,
	entrySupervisorAgent,
	reportsAgent
} from '../agents';
import { GraphStateType, WorkflowStateType } from './types';
import { BranchPathReturnValue } from '@langchain/langgraph/dist/graph/graph';

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
export class AgentWorkflow {
	private readonly options = { recursionLimit: 15, streamMode: 'values' as StreamMode };
	private messages: BaseMessage[] = [];

	private user_input: string;
	private threadId: string;
	private response: Response;

	private GraphState: GraphStateType;

	constructor(userInput: string, threadId: string, response: Response) {
		this.messages = [new HumanMessage(userInput)];

		this.threadId = threadId;
		this.response = response;
		this.user_input = userInput;

		// Set SSE headers
		this.response.setHeader('Content-Type', 'text/event-stream');
		this.response.setHeader('Cache-Control', 'no-cache');
		this.response.setHeader('Connection', 'keep-alive');

		// Initialize GraphState
		this.GraphState = Annotation.Root({
			user_input: Annotation<string>,
			messages: Annotation<BaseMessage[]>({
				reducer: (x, y) => x.concat(y),
				default: () => []
			}),
			next: Annotation({
				// The routing key; defaults to END if not set
				reducer: (state, update) => update ?? state ?? END,
				default: () => END
			})
		});
	}

	@IsRelevant
	public async streamGraph(): Promise<void> {
		// Create and compile the graph
		const graph = new StateGraph(this.GraphState)
			.addNode('entry_supervisor', entrySupervisorAgent)
			.addNode('documentation_agent', documentationAgent)
			.addNode('analytics_supervisor', analyticsSupervisor)
			.addNode('bi_dashboards_agent', biDashboardsAgent)
			.addNode('reports_agent', reportsAgent)
			.addEdge(START, 'entry_supervisor')
			.addConditionalEdges('entry_supervisor', (state: WorkflowStateType) => state.next as BranchPathReturnValue)
			.addConditionalEdges(
				'analytics_supervisor',
				(state: WorkflowStateType) => state.next as BranchPathReturnValue
			)
			.addEdge('documentation_agent', END)
			.addEdge('bi_dashboards_agent', END)
			.addEdge('reports_agent', END)
			.compile();

		const stream = graph.stream({ messages: this.messages, user_input: this.user_input }, this.options);

		// Extract graph events and stream them back
		for await (const { messages } of await stream) {
			let msg = messages[messages?.length - 1];
			if (msg?.content) {
				console.log(msg.content);
			} else if (msg?.tool_calls?.length > 0) {
				console.log(msg.tool_calls);
			} else {
				console.log(msg);
			}
			console.log('-----\n');
		}
		this.response.end();
	}
}
