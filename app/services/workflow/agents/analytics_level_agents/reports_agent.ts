import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SuperWorkflow } from '../../graphs/super_graph';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { last180DaysTool, loadTool } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';
import { reportsMeta } from './utils';

export const reportsAgent = async (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const meta = await (async () => {
		try {
			return await reportsMeta(state.merchant_id, state.user_id);
		} catch (e) {
			if (e instanceof Error && e.message.includes('403')) {
				throw new Error(
					'Current user is not authorized to access this feature. Use other agents to get the data you need.'
				);
			}
			throw e;
		}
	})();

	const stateModifier = agentStateModifier(
		REPORTS_BUILDER_AGENT_PROMPT,
		[loadTool, last180DaysTool],
		ANALYTICS_MEMBERS,
		meta
	);
	const reportsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [loadTool, last180DaysTool],
		stateModifier
	});

	return runAgentNode({
		state,
		agent: reportsReactAgent,
		name: 'Reports',
		supervisorName: 'Analytics_Supervisor'
	});
};
