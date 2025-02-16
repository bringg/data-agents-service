import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';
import { metaTool } from '../../tools/analytic_tools/reports/meta_tool';
import { SuperWorkflow } from '../../graphs/super_graph';

export const reportsAgent = (state: AnalyticsWorkflowStateType) => {
	const stateModifier = agentStateModifier(REPORTS_BUILDER_AGENT_PROMPT, [metaTool], ANALYTICS_MEMBERS);
	const biDashboardsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [metaTool],
		stateModifier
	});
	return runAgentNode({ state, agent: biDashboardsReactAgent, name: 'Reports' });
};
