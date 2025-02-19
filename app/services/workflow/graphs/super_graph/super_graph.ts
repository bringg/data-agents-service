import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END, StreamMode } from '@langchain/langgraph';
import { Response } from 'express';
import { IsRelevant } from '../../decorators';
import { composerAgent, documentationAgent } from '../../agents';
import { CompiledSuperWorkflowType, SuperGraphStateType, SuperWorkflowStateType } from './types';
import { AnalyticsWorkflow } from '../analytics_sub_graph';
import { createTeamSupervisor } from '../../agents/utils';
import { MAIN_SUPERVISOR_PROMPT } from '../../prompts';
import { SUPER_MEMBERS } from '../../agents/super_level_agents/constants';
import { humanNode } from '../../agents/human_node';
import { v4 as uuidv4 } from 'uuid';
import { RedisSaver } from '../../memory/short-term';
import redis from '@bringg/service/lib/redis';
import { createLLM } from '../../utils';
import { RunnableLambda } from '@langchain/core/runnables';
import { StatusCodes } from 'http-status-codes';

export class SuperWorkflow {
	private readonly options = { recursionLimit: 15, subgraphs: true, streamMode: 'messages' as StreamMode };

	public static readonly llm = createLLM({ provider: 'vertexai', model: 'gemini-2.0-flash' });

	private static superGraph: CompiledSuperWorkflowType;
	private static checkpointer: RedisSaver;
	private static GraphState: SuperGraphStateType;

	public static async initialize() {
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
		const supervisorAgent = await createTeamSupervisor(
			// Only gpt-4o right now has an option to push system message
			// at the end of it's input, it's necessary for FINISH
			createLLM({ model: 'gpt-4o-mini', provider: 'openai' }),
			MAIN_SUPERVISOR_PROMPT,
			SUPER_MEMBERS,
			true
		);

		// Create analytics chain
		const analyticsWorkflow = new AnalyticsWorkflow(this.llm);
		const analyticsSubGraph = await analyticsWorkflow.createAnalyticsGraph();

		const getMessages = RunnableLambda.from((state: SuperWorkflowStateType) => {
			return { messages: state.messages };
		});

		const joinGraph = RunnableLambda.from((response: any) => {
			return {
				messages: [response.messages[response.messages.length - 1]]
			};
		});

		// Create and compile the graph
		this.superGraph = new StateGraph(this.GraphState)
			.addNode('AnalyticsTeam', getMessages.pipe(analyticsSubGraph).pipe(joinGraph), {})
			.addNode('Documentation', documentationAgent)
			.addNode('Supervisor', supervisorAgent)
			.addNode('HumanNode', humanNode)
			.addNode('Composer', composerAgent)
			.addEdge('AnalyticsTeam', 'Supervisor')
			.addEdge('Documentation', 'Supervisor')
			.addConditionalEdges('Supervisor', (x: any) => x.next, {
				AnalyticsTeam: 'AnalyticsTeam',
				Documentation: 'Documentation',
				HumanNode: 'HumanNode',
				FINISH: 'Composer'
			})
			.addEdge(START, 'Supervisor')
			.addEdge('Composer', END)
			.compile({ checkpointer: this.checkpointer });
	}

	@IsRelevant
	public async streamGraph(
		response: Response,
		userInput: string,
		merchantId: number,
		userId: number,
		threadId: string = uuidv4()
	): Promise<void> {
		//Set SSE headers
		response.setHeader('Content-Type', 'text/event-stream');
		response.setHeader('Cache-Control', 'no-cache');
		response.setHeader('Connection', 'keep-alive');

		const stream = await SuperWorkflow.superGraph.stream(
			{
				messages: [new HumanMessage({ content: userInput })],
				merchant_id: merchantId,
				user_id: userId
			},
			{ ...this.options, configurable: { thread_id: threadId } }
		);

		response.write(`id: ${threadId}\n`);
		response.write(`event: Response\n`);

		// Extract graph events and stream them back

		try {
			for await (const [_, metadata] of stream) {
				if (metadata[1]?.langgraph_node === 'Composer' || metadata[1]?.langgraph_node === 'HumanNode') {
					response.write(`data: ${metadata[0].content} \n\n`);
				}
			}
		} catch (e) {
			console.error(e);
			response.status(StatusCodes.INTERNAL_SERVER_ERROR);
			response.write(`event: Error\n`);
			// TODO - const dict of default messages
			response.write(`data: Sorry, it seems like I encountered a problem. Let's try again! \n\n`);
		}

		response.end();
	}
}

export const workflow = new SuperWorkflow();
