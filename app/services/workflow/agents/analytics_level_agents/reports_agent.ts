import { BaseMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SuperWorkflow } from '../../graphs/super_graph';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { loadTool, metaTool } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';

export const reportsAgent = (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const stateModifier = agentStateModifier(REPORTS_BUILDER_AGENT_PROMPT, [metaTool, loadTool], ANALYTICS_MEMBERS);
	const reportsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [metaTool, loadTool],
		stateModifier
	});

	return runAgentNode({ state, agent: reportsReactAgent, name: 'Reports' });
};
