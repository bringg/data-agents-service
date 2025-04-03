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
	const userContext = {
		userId: state.user_id,
		merchantId: state.merchant_id
	};

	const meta = await widgetCatalogMeta(userContext);

	const stateModifier = agentStateModifier({
		systemPrompt: BI_DASHBOARDS_AGENT_PROMPT,
		tools: [...WIDGET_DATA_TOOLS],
		teamMembers: ANALYTICS_MEMBERS,
		time_zone: state.time_zone,
		meta
	});
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
