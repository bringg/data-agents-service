import { BaseMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SuperWorkflow } from '../../graphs/super_graph';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { last180DaysTool, loadTool } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';
import { handleUnauthorizedAccess, reportsMeta } from './utils';

export const reportsAgent = async (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const userContext = {
		userId: state.user_id,
		merchantId: state.merchant_id
	};

	const meta = await handleUnauthorizedAccess(() => reportsMeta(userContext));

	const stateModifier = agentStateModifier({
		systemPrompt: REPORTS_BUILDER_AGENT_PROMPT,
		tools: [loadTool, last180DaysTool],
		teamMembers: ANALYTICS_MEMBERS,
		time_zone: state.time_zone,
		meta: JSON.stringify({ cubeDependencies: meta.cubeDependencies, cubes: meta.cubes })
	});
	const reportsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [loadTool, last180DaysTool],
		stateModifier
	});

	return runAgentNode({
		state,
		agent: reportsReactAgent,
		name: 'Reports',
		supervisorName: 'Analytics_Supervisor',
		meta
	});
};
