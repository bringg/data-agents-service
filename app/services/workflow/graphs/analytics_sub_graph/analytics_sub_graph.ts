import { BaseMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { biDashboardsAgent, reportsAgent } from '../../agents';
import { AnalyticsGraphStateType } from './types';
import { ANALYTICS_MEMBERS } from '../../agents/analytics_level_agents/constants';
import { ChatOpenAI } from '@langchain/openai';
import { ANALYTICS_SUPERVISOR_PROMPT } from '../../prompts';
import { createTeamSupervisor } from '../../agents/utils';

export class AnalyticsWorkflow {
	private GraphState: AnalyticsGraphStateType;
	private llm: ChatOpenAI;

	constructor(llm: ChatOpenAI) {
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
				default: () => "Solve the human's question."
			}),
			llm: Annotation<ChatOpenAI>
		});

		this.llm = llm;
	}

	public async createAnalyticsGraph() {
		// Create graph supervisor
		const supervisorAgent = await createTeamSupervisor(this.llm, ANALYTICS_SUPERVISOR_PROMPT, ANALYTICS_MEMBERS);

		// Create and compile the graph
		const analyticsGraph = new StateGraph(this.GraphState)
			.addNode('BiDashboards', biDashboardsAgent)
			.addNode('Reports', reportsAgent)
			.addNode('AnalyticsSupervisor', supervisorAgent)
			.addEdge('BiDashboards', 'AnalyticsSupervisor')
			.addEdge('BiDashboards', 'AnalyticsSupervisor')
			.addConditionalEdges(
				'AnalyticsSupervisor',
				(x: any) => {
					console.log(x);
					return x.next;
				},
				{
					BiDashboardsAgent: 'BiDashboards',
					ReportsAgent: 'Reports',
					FINISH: END
				}
			)
			.addEdge(START, 'AnalyticsSupervisor')
			.compile();

		return analyticsGraph;
	}
}
