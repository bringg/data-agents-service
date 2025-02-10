import { ChatOpenAI } from '@langchain/openai';
import { SEMANTIC_ROUTER_PROMPT } from '../prompts';

/**
 *
 * @param question
 * @returns
 */
export const checkQuestionRelevance = async (question: string): Promise<boolean> => {
	const model = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-4o-mini',
		temperature: 0
	});

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

	console.log(response);

	if (typeof response.content === 'string') {
		return response.content.includes('YES');
	}
	return false;
};
