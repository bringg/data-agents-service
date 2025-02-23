import { BaseMessage, SystemMessage } from '@langchain/core/messages';
import { SEMANTIC_ROUTER_PROMPT } from '../prompts';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SuperWorkflow } from '../graphs/super_graph';

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
