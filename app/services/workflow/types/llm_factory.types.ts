import { ChatVertexAI } from '@langchain/google-vertexai';
import { ChatOpenAI } from '@langchain/openai';

export type LLMProvider = 'openai' | 'openai-reasoning' | 'vertexai';
export type ChatAI = ChatOpenAI | ChatVertexAI;

export interface LLMFactoryOptions {
	provider?: LLMProvider;
	model?: string;
	temperature?: number;
}
