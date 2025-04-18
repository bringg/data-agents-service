import { logger, throwProblem } from '@bringg/service';
import redis from '@bringg/service/lib/redis';
import { BaseMessage, HumanMessage, isAIMessageChunk } from '@langchain/core/messages';
import { RunnableLambda } from '@langchain/core/runnables';
import { concat } from '@langchain/core/utils/stream';
import { Annotation, END, START, StateGraph, StreamMode } from '@langchain/langgraph';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import { ERRORS } from '../../../../common';
import { composerAgent, documentationAgent } from '../../agents';
import { humanNode } from '../../agents/human_node';
import { SUPER_MEMBERS } from '../../agents/super_level_agents/constants';
import { createTeamSupervisor } from '../../agents/utils';
import { IsRelevant, SetSSE } from '../../decorators';
import { RedisSaver } from '../../memory/short-term';
import { MAIN_SUPERVISOR_PROMPT } from '../../prompts';
import { createLLM } from '../../utils';
import { AnalyticsWorkflow } from '../analytics_sub_graph';
import { AnalyticsWorkflowStateType } from '../analytics_sub_graph/types';
import { SUPERVISOR_NODES } from '../constants';
import { GRAPH_STATUS_DESCRIPTION } from './constants';
import { CompiledSuperWorkflowType, SSEEvent, SuperGraphStateType, SuperWorkflowStateType } from './types';
import { getCurrentNodeName } from './utils';

export class SuperWorkflow {
	private readonly options = { recursionLimit: 15, subgraphs: true, streamMode: 'messages' as StreamMode };

	private static superGraph: CompiledSuperWorkflowType;
	private static checkpointer: RedisSaver;
	private static GraphState: SuperGraphStateType;

	public static readonly llm = createLLM({ provider: 'vertexai', model: 'gemini-2.0-flash' });
	// openai has better results than vertex for supervising
	public static readonly supervisorLLM = createLLM({ provider: 'openai', model: 'gpt-4o' });
	// more temperature for user facing agents
	public static readonly userFacingLLM = createLLM({ provider: 'openai', model: 'gpt-4o', temperature: 0.2 });

	public static async initialize(): Promise<void> {
		// Initialize GraphState
		this.GraphState = Annotation.Root({
			merchant_id: Annotation<number>,
			user_id: Annotation<number>,
			time_zone: Annotation<string>,
			currency: Annotation<string>,
			messages: Annotation<BaseMessage[]>({
				reducer: (x, y) =>
					x.length > 0 && y.length > 0 && y[y.length - 1].content === x[x.length - 1].content
						? x
						: x.concat(y),
				default: () => []
			}),
			conversation_messages: Annotation<BaseMessage[]>({
				reducer: (x, y) => x.concat(y),
				default: () => []
			}),
			next: Annotation({
				// The routing key; defaults to END if not set
				reducer: (state, update) => update ?? state,
				default: () => 'Documentation'
			}),
			instructions: Annotation<string>({
				reducer: (x, y) => y ?? x,
				default: () => "Resolve the user's request."
			})
		});

		// Create checkpointer
		this.checkpointer = new RedisSaver({ connection: redis.cache });

		// Create super graph supervisor
		const supervisorAgent = await createTeamSupervisor(this.supervisorLLM, MAIN_SUPERVISOR_PROMPT, SUPER_MEMBERS);

		// Create analytics chain
		const analyticsWorkflow = new AnalyticsWorkflow();
		const analyticsSubGraph = await analyticsWorkflow.createAnalyticsGraph();

		const getState = RunnableLambda.from((state: SuperWorkflowStateType) => {
			return {
				messages: state.messages,
				instructions: state.instructions,
				merchant_id: state.merchant_id,
				user_id: state.user_id,
				time_zone: state.time_zone
			};
		});

		const joinGraph = RunnableLambda.from((response: AnalyticsWorkflowStateType) => {
			const lastMessage = response.messages[response.messages.length - 1];

			return {
				messages: [new HumanMessage({ content: lastMessage.content, name: 'AnalyticsTeam' })]
			};
		});

		// Create and compile the graph
		this.superGraph = new StateGraph(this.GraphState)
			.addNode('AnalyticsTeam', getState.pipe(analyticsSubGraph).pipe(joinGraph), {})
			.addNode('Documentation', documentationAgent)
			.addNode(SUPERVISOR_NODES.Supervisor, supervisorAgent)
			.addNode('HumanNode', humanNode)
			.addNode('Composer', composerAgent)
			.addEdge('AnalyticsTeam', SUPERVISOR_NODES.Supervisor)
			.addEdge('Documentation', SUPERVISOR_NODES.Supervisor)
			/* eslint-disable-next-line */
			.addConditionalEdges(SUPERVISOR_NODES.Supervisor, (x: any) => x.next, {
				AnalyticsTeam: 'AnalyticsTeam',
				Documentation: 'Documentation',
				HumanNode: 'HumanNode',
				FINISH: 'Composer'
			})
			.addEdge(START, SUPERVISOR_NODES.Supervisor)
			.addEdge('Composer', END)
			.compile({ checkpointer: this.checkpointer });
	}

	/**
	 * Gets the whole graph state by thread_id and identity
	 */
	public async getStateByThreadID(threadId: string): Promise<SuperWorkflowStateType> {
		const graphState = await SuperWorkflow.superGraph.getState({
			configurable: { thread_id: threadId }
		});

		return graphState.values as SuperWorkflowStateType;
	}

	/**
	 * Get the conversation messages by thread_id and identity
	 * If threadId is fake, or the user doesn't have access to the thread, throw an error
	 * @param threadId
	 * @param userId
	 * @param merchantId
	 * @returns
	 */
	public async getConversationMessages(threadId: string, userId: number, merchantId: number): Promise<BaseMessage[]> {
		const state = await this.getStateByThreadID(threadId);

		if (!state || merchantId !== state.merchant_id || userId !== state.user_id) {
			throwProblem(StatusCodes.NOT_FOUND, 'Chat not found');
		}

		return state.conversation_messages as BaseMessage[];
	}

	/**
	 * Add messages to the conversation by thread_id
	 * @param thread_id
	 * @param message
	 */
	public async addConversationMessages(
		thread_id: string,
		userId: number,
		merchantId: number,
		messages: BaseMessage[]
	): Promise<void> {
		await SuperWorkflow.superGraph.updateState(
			{ configurable: { thread_id } },
			{ conversation_messages: messages, user_id: userId, merchant_id: merchantId }
		);
	}

	private async handleSupervisorMessage(
		response: Response,
		threadId: string,
		node: string,
		prevNode: string,
		metadata: any,
		gathered: any
	): Promise<any> {
		const isSupervisorNode = Boolean(SUPERVISOR_NODES[node]);

		// Gather content from both supervisor types
		if (isSupervisorNode && node === prevNode) {
			gathered = gathered !== undefined ? concat(gathered, metadata[0]) : metadata[0];
		}

		// Stream supervisor outputs when switching to a different node
		if (gathered && isSupervisorNode && node !== prevNode) {
			const { statusMessage, next } = gathered.tool_calls[0].args;

			if (next !== 'HumanNode') {
				logger.info('Streaming Supervisor message', { message: statusMessage });
				this.writeToStream(response, threadId, statusMessage, 'Status-Description');
			}
			gathered = undefined;
		}

		return gathered;
	}

	@SetSSE
	@IsRelevant
	/**
	 * Stream the graph to the client via SSE
	 */
	public async streamGraph(
		response: Response,
		userInput: string,
		merchantId: number,
		userId: number,
		threadId: string = uuidv4(),
		time_zone: string | null,
		currency: string | null
	): Promise<void> {
		const stream = await SuperWorkflow.superGraph.stream(
			{
				conversation_messages: [new HumanMessage({ content: userInput, name: 'User' })],
				messages: [new HumanMessage({ content: userInput, name: 'User' })],
				merchant_id: merchantId,
				user_id: userId,
				...(time_zone ? { time_zone } : {}),
				...(currency ? { currency } : {})
			},
			{ ...this.options, configurable: { thread_id: threadId, userId, merchantId } }
		);

		// Extract graph events and stream them back
		try {
			let prevNode = SUPERVISOR_NODES.Supervisor;
			let gathered = undefined;

			this.writeToStream(response, threadId, threadId, 'ThreadId');

			for await (const [nodes, metadata] of stream) {
				const node = nodes.length > 0 ? getCurrentNodeName(nodes) : SUPERVISOR_NODES.Supervisor;
				const graphStatus = GRAPH_STATUS_DESCRIPTION[node];

				gathered = await this.handleSupervisorMessage(response, threadId, node, prevNode, metadata, gathered);

				// Stream graph status description
				if (graphStatus && prevNode !== node) {
					prevNode = node;
					this.writeToStream(response, threadId, graphStatus, 'Status');
				}

				// Stream final AI message
				if ((node === 'Composer' || node === 'HumanNode') && isAIMessageChunk(metadata[0])) {
					logger.info('Streaming AI message', { message: metadata[0].content });
					this.writeToStream(response, threadId, metadata[0].content as string, 'Response');
				}

				prevNode = node;
			}
		} catch (e) {
			logger.error('Error streaming graph', { error: e });
			response.status(StatusCodes.INTERNAL_SERVER_ERROR);
			this.writeToStream(response, threadId, ERRORS.STREAM_ERROR, 'Error');
			this.addConversationMessages(threadId, userId, merchantId, [
				new HumanMessage({ content: ERRORS.STREAM_ERROR, name: 'Composer' })
			]);
		}

		this.writeToStream(response, threadId, 'Stream ended', 'Stream-Ended');
	}

	public writeToStream(response: Response, threadId: string, message: string, event: SSEEvent): void {
		response.write(`id: ${threadId}\n`);
		response.write(`event: ${event}\n`);
		response.write(`data: ${message}\n\n`);
	}
}

export const workflow = new SuperWorkflow();
