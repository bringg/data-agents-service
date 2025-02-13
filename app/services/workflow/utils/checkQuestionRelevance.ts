import { SEMANTIC_ROUTER_PROMPT } from '../prompts';
import { ChatAI } from './llmFactory';

/**
 *
 * @param question
 * @returns
 */
export const checkQuestionRelevance = async (question: string, llm: ChatAI): Promise<boolean> => {
	const userPrompt = `Question: "${question}"\nResponse:`;

	const response = await llm.invoke([
		{
			role: 'system',
			content: SEMANTIC_ROUTER_PROMPT
		},
		{
			role: 'user',
			content: userPrompt
		}
	]);

	console.log(response);

	if (typeof response.content === 'string') {
		return response.content.includes('YES');
	}
	return false;
};
