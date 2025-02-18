import { ChatVertexAI } from '@langchain/google-vertexai';
import { LLMFactoryOptions } from '../types';
import { ChatOpenAI } from '@langchain/openai';

/**
 * Creates and returns an LLM instance based on the given options.
 *
 * @param options - Configuration options for the LLM.
 * @returns An instance of ChatOpenAI or ChatVertexAI.
 */
export const createLLM = (options: LLMFactoryOptions = {}): ChatOpenAI | ChatVertexAI => {
	const { provider = 'openai', model, temperature } = options;

	if (provider === 'vertexai') {
		return new ChatVertexAI({
			model: model || 'gemini-1.5-flash',
			temperature: temperature ?? 0.2
		});
	}

	// Default to ChatOpenAI
	return new ChatOpenAI({
		model: model || 'gpt-4o-mini',
		temperature: temperature ?? 0.2
	});
};
