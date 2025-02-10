import { WorkflowStateType } from '../graph/types';
import { ChatOpenAI } from '@langchain/openai';
import { SEMANTIC_ROUTER_PROMPT } from '../prompts';
import { TOOL_NAMES } from '../tools';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

export const entrySupervisorAgent = async (state: WorkflowStateType) => {
	const model = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-4o-mini'
	});

	const initialMsg = state.messages[0]?.content || '';
	if (initialMsg.toLowerCase().includes('documentation')) {
		return { next: 'documentation_agent' };
	} else if (initialMsg.toLowerCase().includes('analytics') || initialMsg.toLowerCase().includes('report')) {
		return { next: 'analytics_supervisor' };
	}
	// Default route can be chosen if needed
	return { next: 'documentation_agent' };
};

/**
   * const model = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-4o'
	});

	const prompt = ChatPromptTemplate.fromMessages([
		['system', SEMANTIC_ROUTER_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		system_message: 'You are helpful HR Chatbot Agent.',
		time: new Date().toISOString(),
		tool_names: TOOL_NAMES,
		messages: state.messages,
		question: state.messages[0] // todo - remove
	});

	const result = await model.invoke(formattedPrompt);
	console.log(result);
	return { messages: [result] };
   */
