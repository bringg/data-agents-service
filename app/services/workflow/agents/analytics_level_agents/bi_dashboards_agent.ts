import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { agentStateModifier, runAgentNode } from '../utils';
import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { ANALYTICS_MEMBERS } from './constants';
import { biDashboardsTool } from '../../tools';
import { BI_DASHBOARDS_AGENT_PROMPT } from '../../prompts';
import { SuperWorkflow } from '../../graphs/super_graph';

export const biDashboardsAgent = (state: AnalyticsWorkflowStateType) => {
	const stateModifier = agentStateModifier(BI_DASHBOARDS_AGENT_PROMPT, [biDashboardsTool], ANALYTICS_MEMBERS);
	const biDashboardsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [biDashboardsTool],
		stateModifier
	});
	return runAgentNode({ state, agent: biDashboardsReactAgent, name: 'BiDashboards' });
};
