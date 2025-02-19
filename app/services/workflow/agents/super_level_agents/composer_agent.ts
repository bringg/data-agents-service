import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SuperWorkflow, SuperWorkflowStateType } from '../../graphs/super_graph';
import { COMPOSER_AGENT_PROMPT } from '../../prompts';

export const composerAgent = async (state: SuperWorkflowStateType) => {
	const prompt = ChatPromptTemplate.fromMessages([
		['system', COMPOSER_AGENT_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		messages: state.messages
	});

	await SuperWorkflow.llm.invoke(formattedPrompt);
};
