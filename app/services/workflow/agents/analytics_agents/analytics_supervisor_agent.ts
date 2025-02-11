import { ChatOpenAI } from '@langchain/openai';
import { createTeamSupervisor } from '../utils/create_team_supervisor';
import { analyticsSupervisorMembers } from './constants';
import { ANALYTICS_SUPERVISOR_PROMPT } from '../../prompts';

export const createAnalyticsSupervisorAgent = async () => {
	const llm = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-4o-mini'
	});

	const mainSupervisorAgent = await createTeamSupervisor(
		llm,
		ANALYTICS_SUPERVISOR_PROMPT,
		analyticsSupervisorMembers
	);

	return mainSupervisorAgent;
};
