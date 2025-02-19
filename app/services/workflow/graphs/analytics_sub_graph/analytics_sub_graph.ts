import { BaseMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { biDashboardsAgent, reportsAgent } from '../../agents';
import { AnalyticsGraphStateType } from './types';
import { ANALYTICS_MEMBERS } from '../../agents/analytics_level_agents/constants';
import { ANALYTICS_SUPERVISOR_PROMPT } from '../../prompts';
import { createTeamSupervisor } from '../../agents/utils';
import { ChatAI } from '../../types';
import { RunnableLambda } from '@langchain/core/runnables';
import { createLLM } from '../../utils';

export class AnalyticsWorkflow {
	private GraphState: AnalyticsGraphStateType;
	private llm: ChatAI;

	constructor(llm: ChatAI) {
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
				default: () => 'AnalyticsSupervisor'
			}),
			instructions: Annotation<string>({
				reducer: (x, y) => y ?? x,
				default: () => "Solve the user's question."
			})
		});

		this.llm = llm;
	}

	public async createAnalyticsGraph() {
		// Create graph supervisor
		const supervisorAgent = await createTeamSupervisor(
			createLLM({ model: 'gpt-4o-mini', provider: 'openai' }),
			ANALYTICS_SUPERVISOR_PROMPT,
			ANALYTICS_MEMBERS,
			true
		);

		// Create and compile the graph
		const analyticsGraph = new StateGraph(this.GraphState)
			.addNode('BiDashboards', biDashboardsAgent)
			.addNode('Reports', reportsAgent)
			.addNode('AnalyticsSupervisor', supervisorAgent)
			.addEdge('BiDashboards', 'AnalyticsSupervisor')
			.addEdge('Reports', 'AnalyticsSupervisor')
			.addConditionalEdges('AnalyticsSupervisor', (x: any) => x.next, {
				BiDashboards: 'BiDashboards',
				Reports: 'Reports',
				FINISH: END
			})
			.addEdge(START, 'AnalyticsSupervisor');

		const enterAnalyticsChain = RunnableLambda.from(({ messages }: { messages: BaseMessage[] }) => {
			return {
				messages: messages,
				team_members: ANALYTICS_MEMBERS
			};
		});

		return enterAnalyticsChain.pipe(analyticsGraph.compile());
	}
}
