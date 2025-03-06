import { BaseMessage, MessageContentComplex } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

import { SuperWorkflow } from '../graphs/super_graph';
import { SEMANTIC_ROUTER_PROMPT } from '../prompts';

/**
 * Check if a question is relevant to the current conversation context.
 * @param messages The conversation history.
 * @returns Whether the question is relevant or not, and an optional description if the question is not relevant.
 */
export const checkQuestionRelevance = async (
	messages: BaseMessage[]
): Promise<{ isRelevant: boolean; description?: string }> => {
	const model = SuperWorkflow.llm;

	const prompt = ChatPromptTemplate.fromMessages([
		['system', SEMANTIC_ROUTER_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		messages
	});

	const { content } = await model.invoke(formattedPrompt);

	const isRelevant = content.includes('YES' as string & MessageContentComplex);

	if (isRelevant) {
		return { isRelevant };
	}

	const modelRes = await model.invoke([
		[
			'system',
			`Please tell the user that you found it's 
				question non related to the Bringg's platfrom. 
				Be respectful and clear. Try to ask the user for a different question or to rephrase it.`
		],
		messages[messages.length - 1]
	]);

	const description = modelRes.content as string;

	return { isRelevant, description };
};
