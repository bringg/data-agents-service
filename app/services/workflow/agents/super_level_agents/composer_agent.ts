import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

import { SuperWorkflow, SuperWorkflowStateType } from '../../graphs/super_graph';
import { COMPOSER_AGENT_PROMPT } from '../../prompts';

export const composerAgent = async (
	state: SuperWorkflowStateType
): Promise<{ conversation_messages: HumanMessage[] }> => {
	const prompt = ChatPromptTemplate.fromMessages([
		['system', COMPOSER_AGENT_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		messages: state.messages,
		currency: state.currency,
		time_zone: state.time_zone
	});

	const { content } = await SuperWorkflow.userFacingLLM.invoke(formattedPrompt);

	return {
		conversation_messages: [
			new HumanMessage({
				content,
				name: 'Composer',
				additional_kwargs: {
					timestamp: new Date().toISOString() // ISO 8601 format with timezone
				}
			})
		]
	};
};
