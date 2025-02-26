import { BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

import { SuperWorkflow } from '../graphs/super_graph';
import { SEMANTIC_ROUTER_PROMPT } from '../prompts';

/**
 * Check if a question is relevant to the current conversation context.
 * @param question
 * @returns
 */
export const checkQuestionRelevance = async (messages: BaseMessage[]): Promise<boolean> => {
	const model = SuperWorkflow.llm;

	const prompt = ChatPromptTemplate.fromMessages([
		['system', SEMANTIC_ROUTER_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		messages
	});

	const response = await model.invoke(formattedPrompt);

	if (typeof response.content === 'string') {
		return response.content.includes('YES');
	}

	return false;
};
