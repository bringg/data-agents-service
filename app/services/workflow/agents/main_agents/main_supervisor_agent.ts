import { ChatOpenAI } from '@langchain/openai';
import { MAIN_SUPERVISOR_PROMPT } from '../../prompts';
import { mainSupervisorMembers } from './constants';
import { createTeamSupervisor } from '../utils/create_team_supervisor';

export const createMainSupervisorAgent = async () => {
	const llm = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-4o-mini'
	});

	const mainSupervisorAgent = await createTeamSupervisor(llm, MAIN_SUPERVISOR_PROMPT, mainSupervisorMembers);

	return mainSupervisorAgent;
};

/**
 * const prompt = ChatPromptTemplate.fromMessages([
		['system', ENTRY_SUPERVISOR_PROMPT],
		new MessagesPlaceholder('messages')
	]);
	const formattedPrompt = await prompt.formatMessages({
		messages: state.messages
	});

	console.log(formattedPrompt);

	const result = await model.invoke(formattedPrompt);
	console.log(result.content);
	return { next: result };
 */
