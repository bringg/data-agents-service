import { BaseMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SuperWorkflow } from '../../graphs/super_graph';
import { BI_DASHBOARDS_AGENT_PROMPT } from '../../prompts';
import { WIDGET_DATA_TOOLS } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';
import { widgetCatalogMeta } from './utils';

export const biDashboardsAgent = async (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const meta = await widgetCatalogMeta(state.merchant_id, state.user_id);

	const stateModifier = agentStateModifier(
		BI_DASHBOARDS_AGENT_PROMPT,
		[...WIDGET_DATA_TOOLS],
		ANALYTICS_MEMBERS,
		meta
	);
	const biDashboardsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [...WIDGET_DATA_TOOLS],
		stateModifier
	});

	return runAgentNode({
		state,
		agent: biDashboardsReactAgent,
		name: 'BiDashboards',
		supervisorName: 'Analytics_Supervisor'
	});
};
