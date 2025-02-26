import { HumanMessage } from '@langchain/core/messages';
import { JsonOutputToolsParser, ParsedToolCall } from '@langchain/core/output_parsers/openai_tools';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { z } from 'zod';

import { ChatAI } from '../../types';

/**
 * Create a team supervisor runnable that will select the next role in the team.
 *
 * @param llm - The ChatAI instance to use.
 * @param systemPrompt - The system prompt to use.
 * @param members - The members to select from.
 * @returns The team supervisor runnable.
 */
export const createTeamSupervisor = async (llm: ChatAI, systemPrompt: string, members: string[]): Promise<Runnable> => {
	const options = ['FINISH', ...members];

	const routeTool = {
		name: 'route',
		description: 'Select the next role.',
		schema: z.object({
			reasoning: z.string(),
			next: z.enum(['FINISH', ...members]),
			instructions: z
				.string()
				.describe('The specific instructions of the sub-task the next role should accomplish.')
		})
	};

	const prompt = ChatPromptTemplate.fromMessages([
		['system', systemPrompt],
		new MessagesPlaceholder('messages'),
		new HumanMessage('system'),
		new HumanMessage(
			`Given the conversation above, who should act next? Or should we FINISH? Select one of: ${options.join(
				', '
			)}`
		)
	]);

	const supervisor = prompt
		// Bind the route tool to the LLM
		.pipe(
			llm.bindTools([routeTool], {
				tool_choice: 'route'
			})
		)
		// Parse the output
		.pipe(new JsonOutputToolsParser())
		// Extract the next role and instructions
		.pipe(async (x: ParsedToolCall[]) => {
			return {
				next: x[0].args.next,
				instructions: x[0].args.instructions
			};
		});

	return supervisor;
};
