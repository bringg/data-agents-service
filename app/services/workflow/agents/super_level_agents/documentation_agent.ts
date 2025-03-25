import { HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { SuperWorkflow } from '../../graphs/super_graph';
import { SuperWorkflowStateType } from '../../graphs/super_graph/types';
import { DOCUMENTATION_AGENT_PROMPT } from '../../prompts';
import { ragFetchTool } from '../../tools/super_tools';
import { agentStateModifier, runAgentNode } from '../utils';
import { SUPER_MEMBERS } from './constants';

export const documentationAgent = async (state: SuperWorkflowStateType): Promise<{ messages: HumanMessage[] }> => {
	const stateModifier = agentStateModifier(DOCUMENTATION_AGENT_PROMPT, [ragFetchTool], SUPER_MEMBERS);

	const docsReactAgent = createReactAgent({
		llm: SuperWorkflow.llm,
		tools: [ragFetchTool],
		stateModifier
	});

	return runAgentNode({ state, agent: docsReactAgent, name: 'Documentation', supervisorName: 'Supervisor' });
};
