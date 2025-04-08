import { BaseMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig, RunnableLambda } from '@langchain/core/runnables';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';

import { analyzerAgent, biDashboardsAgent, reportsAgent } from '../../agents';
import { ANALYTICS_MEMBERS } from '../../agents/analytics_level_agents/constants';
import { createTeamSupervisor } from '../../agents/utils';
import { ANALYTICS_SUPERVISOR_PROMPT } from '../../prompts';
import { SuperWorkflow } from '../super_graph';
import { AnalyticsGraphStateType, AnalyticsWorkflowStateType } from './types';

export class AnalyticsWorkflow {
	private GraphState: AnalyticsGraphStateType;

	constructor() {
		// Initialize GraphState
		this.GraphState = Annotation.Root({
			merchant_id: Annotation<number>,
			user_id: Annotation<number>,
			time_zone: Annotation<string>,
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
			}),
			tool_messages: Annotation<BaseMessage[]>({
				reducer: (x, y) => x.concat(y),
				default: () => []
			})
		});
	}

	public async createAnalyticsGraph(): Promise<
		/* eslint-disable-next-line */
		Runnable<{ messages: BaseMessage[] }, any, RunnableConfig<Record<string, any>>>
	> {
		// Create graph supervisor
		const supervisorAgent = await createTeamSupervisor(
			SuperWorkflow.supervisorLLM,
			ANALYTICS_SUPERVISOR_PROMPT,
			ANALYTICS_MEMBERS
		);

		// Create and compile the graph
		const analyticsGraph = new StateGraph(this.GraphState)
			.addNode('BiDashboards', biDashboardsAgent)
			.addNode('Reports', reportsAgent)
			.addNode('AnalyticsSupervisor', supervisorAgent)
			.addNode('Analyzer', analyzerAgent)
			.addEdge('BiDashboards', 'AnalyticsSupervisor')
			.addEdge('Reports', 'AnalyticsSupervisor')
			.addEdge('Analyzer', 'AnalyticsSupervisor')
			.addConditionalEdges('AnalyticsSupervisor', (x: any) => x.next, {
				/* eslint-disable-next-line */
				BiDashboards: 'BiDashboards',
				Reports: 'Reports',
				Analyzer: 'Analyzer',
				FINISH: END
			})
			.addEdge(START, 'AnalyticsSupervisor');

		const enterAnalyticsChain = RunnableLambda.from(
			({ messages, instructions, merchant_id, user_id, time_zone }: Partial<AnalyticsWorkflowStateType>) => {
				return {
					messages: messages,
					instructions: instructions,
					merchant_id: merchant_id,
					user_id: user_id,
					time_zone: time_zone,
					team_members: ANALYTICS_MEMBERS
				};
			}
		);

		return enterAnalyticsChain.pipe(analyticsGraph.compile());
	}
}
