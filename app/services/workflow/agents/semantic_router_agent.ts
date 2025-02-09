import { ChatOpenAI } from '@langchain/openai';
import { GraphState } from '../graph/graph';
import { SEMANTIC_ROUTER_PROMPT } from '../prompts';
import { TOOL_NAMES, TOOLS } from '../tools';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

export const semanticRouter = async (state: typeof GraphState.State) => {
	const model = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-o4-mini'
	}).bindTools(TOOLS);

	const prompt = ChatPromptTemplate.fromMessages([
		['system', SEMANTIC_ROUTER_PROMPT],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		system_message: 'You are helpful HR Chatbot Agent.',
		time: new Date().toISOString(),
		tool_names: TOOL_NAMES,
		messages: state.messages
	});

	const result = await model.invoke(formattedPrompt);
	return { messages: [result] };
};
