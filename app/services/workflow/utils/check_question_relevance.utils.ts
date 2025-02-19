import { SEMANTIC_ROUTER_PROMPT } from '../prompts';
import { createLLM } from './llm_factory.utils';

/**
 *
 * @param question
 * @returns
 */
export const checkQuestionRelevance = async (question: string): Promise<boolean> => {
	const model = createLLM({ provider: 'vertexai', model: 'gemini-2.0-flash' });

	const userPrompt = `Question: "${question}"\nResponse:`;

	const response = await model.invoke([
		{
			role: 'system',
			content: SEMANTIC_ROUTER_PROMPT
		},
		{
			role: 'user',
			content: userPrompt
		}
	]);

	if (typeof response.content === 'string') {
		return response.content.includes('YES');
	}
	return false;
};
