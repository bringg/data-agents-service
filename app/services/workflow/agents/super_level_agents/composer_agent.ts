import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SuperWorkflow, SuperWorkflowStateType } from '../../graphs/super_graph';
import { COMPOSER_AGENT_PROMPT } from '../../prompts';
import { HumanMessage } from '@langchain/core/messages';

export const composerAgent = async (state: SuperWorkflowStateType) => {
	const prompt = ChatPromptTemplate.fromMessages([
		['system', COMPOSER_AGENT_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		messages: state.messages
	});

	const { content } = await SuperWorkflow.llm.invoke(formattedPrompt);

	return { conversation_messages: [new HumanMessage({ content, name: 'Composer' })] };
};
