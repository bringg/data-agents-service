import { ChatVertexAI } from '@langchain/google-vertexai';
import { ChatOpenAI } from '@langchain/openai';

export type LLMProvider = 'openai' | 'vertexai';
export type ChatAI = ChatOpenAI | ChatVertexAI;

export interface LLMFactoryOptions {
	provider?: LLMProvider;
	model?: string;
	temperature?: number;
}
