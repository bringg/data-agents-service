import { HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { SuperWorkflow } from '../../graphs/super_graph';
import { SuperWorkflowStateType } from '../../graphs/super_graph/types';
import { DOCUMENTATION_AGENT_PROMPT } from '../../prompts';
import { ragFetchTool } from '../../tools/super_tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { SUPER_MEMBERS } from './constants';

export const documentationAgent = async (state: SuperWorkflowStateType): Promise<{ messages: HumanMessage[] }> => {
	const stateModifier = agentStateModifier({
		systemPrompt: DOCUMENTATION_AGENT_PROMPT,
		tools: [ragFetchTool],
		teamMembers: SUPER_MEMBERS,
		time_zone: state.time_zone
	});

	const docsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [ragFetchTool],
		stateModifier,
		name: 'Documentation'
	});

	return runAgentNode({ state, agent: docsReactAgent, name: 'Documentation', supervisorName: 'Supervisor' });
};
