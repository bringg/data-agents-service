import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { REPORTS_BUILDER_AGENT_PROMPT } from '../../prompts';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';
import { SuperWorkflow } from '../../graphs/super_graph';
import { loadTool, metaTool } from '../../tools';
import { createLLM } from '../../utils';

export const reportsAgent = (state: AnalyticsWorkflowStateType) => {
	const stateModifier = agentStateModifier(REPORTS_BUILDER_AGENT_PROMPT, [metaTool, loadTool], ANALYTICS_MEMBERS);
	const reportsReactAgent = createReactAgent({
		llm: createLLM({ provider: 'vertexai', model: 'gemini-2.0-flash' }),
		tools: [metaTool, loadTool],
		stateModifier
	});
	return runAgentNode({ state, agent: reportsReactAgent, name: 'Reports' });
};
