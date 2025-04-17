import { BaseMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { AnalyticsWorkflowStateType } from '../../graphs/analytics_sub_graph/types';
import { SUPERVISOR_NODES } from '../../graphs/constants';
import { SuperWorkflow } from '../../graphs/super_graph';
import { ANALYZER_AGENT_PROMPT } from '../../prompts';
import { secondsToMinutesTool } from '../../tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { ANALYTICS_MEMBERS } from './constants';

export const analyzerAgent = async (state: AnalyticsWorkflowStateType): Promise<{ messages: BaseMessage[] }> => {
	const stateModifier = agentStateModifier({
		systemPrompt: ANALYZER_AGENT_PROMPT,
		tools: [secondsToMinutesTool],
		teamMembers: ANALYTICS_MEMBERS
	});

	const analyzerReactAgent = createReactAgent({
		llm: SuperWorkflow.supervisorLLM,
		tools: [secondsToMinutesTool],
		stateModifier,
		name: 'Analyzer'
	});

	return runAgentNode({
		state,
		agent: analyzerReactAgent,
		name: 'Analyzer',
		hasToolHistory: true,
		hasHistory: true,
		supervisorName: SUPERVISOR_NODES.AnalyticsSupervisor
	});
};
