import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { agentStateModifier, runAgentNode } from '../utils';
import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { ANALYTICS_MEMBERS } from './constants';
import { WIDGET_DATA_TOOLS, widgetCatalogMetaTool } from '../../tools';
import { BI_DASHBOARDS_AGENT_PROMPT } from '../../prompts';
import { SuperWorkflow } from '../../graphs/super_graph';
import { widgetTypeBarDataTool } from '../../tools/analytic_tools/bi_dashboards/widget_type_bar_data_tool';

export const biDashboardsAgent = (state: AnalyticsWorkflowStateType) => {
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
