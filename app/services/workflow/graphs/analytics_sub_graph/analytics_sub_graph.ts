import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END, StreamMode } from '@langchain/langgraph';
import { biDashboardsAgent, createAnalyticsSupervisorAgent, reportsAgent } from '../../agents';
import { AnalyticsGraphStateType } from './types';
import { Runnable, RunnableConfig, RunnableLambda } from '@langchain/core/runnables';
import { analyticsSupervisorMembers } from '../../agents/analytics_agents/constants';

export class AnalyticsSubGraph {
	private readonly options = { recursionLimit: 15, streamMode: 'updates' as StreamMode };
	private messages: BaseMessage[] = [];

	private userInput: string;
	private threadId: string;
	private merchantId: number;
	private userId: number;

	private GraphState: AnalyticsGraphStateType;

	constructor(userInput: string, threadId: string, merchantId: number, userId: number) {
		this.messages = [new HumanMessage(userInput)];

		this.threadId = threadId;
		this.userInput = userInput;
		this.merchantId = merchantId;
		this.userId = userId;

		// Initialize GraphState
		this.GraphState = Annotation.Root({
			merchant_id: Annotation<number>,
			user_id: Annotation<number>,
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

	public async createAnalyticsChain(): Promise<
		Runnable<
			{
				messages: BaseMessage[];
			},
			any,
			RunnableConfig<Record<string, any>>
		>
	> {
		// Create graph supervisor
		const analyticsSupervisorAgent = await createAnalyticsSupervisorAgent();

		// Create and compile the graph
		const analyticsSubGraph = new StateGraph(this.GraphState)
			.addNode('BiDashboardsAgent', biDashboardsAgent)
			.addNode('ReportsAgent', reportsAgent)
			.addNode('AnalyticsSupervisor', analyticsSupervisorAgent)
			.addEdge('BiDashboardsAgent', 'AnalyticsSupervisor')
			.addEdge('ReportsAgent', 'AnalyticsSupervisor')
			.addConditionalEdges('AnalyticsSupervisor', (x: any) => x.next, {
				BiDashboardsAgent: 'BiDashboardsAgent',
				ReportsAgent: 'ReportsAgent',
				FINISH: END
			})
			.addEdge(START, 'AnalyticsSupervisor');

		const enterAuthoringChain = RunnableLambda.from(({ messages }: { messages: BaseMessage[] }) => {
			return {
				messages: messages,
				team_members: analyticsSupervisorMembers
			};
		});

		const analyticsChain = enterAuthoringChain.pipe(analyticsSubGraph.compile());

		return analyticsChain;
	}
}
