import { BaseMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SuperWorkflow } from '../../graphs/super_graph';
import { BI_DASHBOARDS_AGENT_PROMPT } from '../../prompts';
import { /**WIDGET_DATA_TOOLS,*/ widgetCatalogMetaTool } from '../../tools';
import { widgetTypeBarDataTool } from '../../tools/analytic_tools/bi_dashboards/widget_type_bar_data_tool';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';

export const biDashboardsAgent = (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const stateModifier = agentStateModifier(
		BI_DASHBOARDS_AGENT_PROMPT,
		[
			widgetCatalogMetaTool,
			widgetTypeBarDataTool
			//  ...WIDGET_DATA_TOOLS
		],
		ANALYTICS_MEMBERS
	);
	const biDashboardsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [
			widgetCatalogMetaTool,
			widgetTypeBarDataTool
			//  ...WIDGET_DATA_TOOLS
		],
		stateModifier
	});

	return runAgentNode({ state, agent: biDashboardsReactAgent, name: 'BiDashboards' });
};
