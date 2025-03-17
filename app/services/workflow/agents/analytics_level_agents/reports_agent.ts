import { BaseMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SuperWorkflow } from '../../graphs/super_graph';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { loadTool } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';
import { reportsMeta } from './utils';

export const reportsAgent = async (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const meta = await reportsMeta(state.merchant_id, state.user_id);

	const stateModifier = agentStateModifier(REPORTS_BUILDER_AGENT_PROMPT, [loadTool], ANALYTICS_MEMBERS, meta);
	const reportsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [loadTool],
		stateModifier
	});

	return runAgentNode({ state, agent: reportsReactAgent, name: 'Reports', supervisorName: 'Analytics_Supervisor' });
};
