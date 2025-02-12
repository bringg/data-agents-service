import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AnalyticsGraphStateType } from '../../graphs/analytics_sub_graph/types';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { reportsBuilderTool } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';

export const reportsAgent = (state: AnalyticsGraphStateType) => {
	const stateModifier = agentStateModifier(REPORTS_BUILDER_AGENT_PROMPT, [reportsBuilderTool], ANALYTICS_MEMBERS);
	const biDashboardsReactAgent = createReactAgent({
		llm: state.State.llm,
		tools: [reportsBuilderTool],
		stateModifier
	});
	return runAgentNode({ state, agent: biDashboardsReactAgent, name: 'Reports' });
};
