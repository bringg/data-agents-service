import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END, StreamMode } from '@langchain/langgraph';
import { Response } from 'express';
import { IsRelevant } from '../../decorators';
import { documentationAgent } from '../../agents';
import { CompiledSuperWorkflowType, SuperGraphStateType } from './types';
import { AnalyticsWorkflow } from '../analytics_sub_graph';
import { createTeamSupervisor } from '../../agents/utils';
import { MAIN_SUPERVISOR_PROMPT } from '../../prompts';
import { SUPER_MEMBERS } from '../../agents/super_level_agents/constants';
import { humanNode } from '../../agents/human_node';
import { v4 as uuidv4 } from 'uuid';
import { RedisSaver } from '../../memory/short-term';
import redis from '@bringg/service/lib/redis';
import { createLLM } from '../../utils';

export class SuperWorkflow {
	private readonly options = { recursionLimit: 15, subgraphs: true };

	public static readonly llm = createLLM({ provider: 'vertexai', model: 'gemini-1.5-pro-002' });

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
		const supervisorAgent = await createTeamSupervisor(this.llm, MAIN_SUPERVISOR_PROMPT, SUPER_MEMBERS);

		// Create analytics chain
		const analyticsWorkflow = new AnalyticsWorkflow(this.llm);
		const analyticsSubGraph = await analyticsWorkflow.createAnalyticsGraph();

		// Create and compile the graph
		this.superGraph = new StateGraph(this.GraphState)
			.addNode('AnalyticsTeam', analyticsSubGraph)
			.addNode('Documentation', documentationAgent)
			.addNode('Supervisor', supervisorAgent)
			.addNode('HumanNode', humanNode)
			.addEdge('AnalyticsTeam', 'Supervisor')
			.addEdge('Documentation', 'Supervisor')
			.addEdge('HumanNode', 'Supervisor')
			.addConditionalEdges('Supervisor', (x: any) => x.next, {
				AnalyticsTeam: 'AnalyticsTeam',
				Documentation: 'Documentation',
				HumanNode: 'HumanNode',
				FINISH: END
			})
			.addEdge(START, 'Supervisor')
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

		// Extract graph events and stream them back
		response.write(`data: ${threadId}\n\n`);

		for await (const chunk of stream) {
			console.log(chunk[1]['tools'] ? chunk[1]['tools']['messages'][0] : chunk[1]);
			if (Object.keys(chunk[1])[0] === '__interrupt__') {
				response.write(`data: ${chunk[1].__interrupt__[0].value}\n\n`);
			}
			if (chunk[1]?.['Reports']?.['messages']) {
				response.write(`data: ${chunk[1]['Reports']['messages'][0]['content']}\n\n`);
			}
			console.log('\n====\n');
		}

		response.end();
	}
}

export const workflow = new SuperWorkflow();
