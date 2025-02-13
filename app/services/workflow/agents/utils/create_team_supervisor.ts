import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools';
import { Runnable } from '@langchain/core/runnables';
import { ChatAI } from '../../utils/llmFactory';
import { z } from 'zod';

/**
 * Create a team supervisor runnable that will select the next role in the team.
 *
 * @param llm - The ChatAI instance to use.
 * @param systemPrompt - The system prompt to use.
 * @param members - The members to select from.
 * @returns The team supervisor runnable.
 */
export const createTeamSupervisor = async (
	llm: ChatAI,
	systemPrompt: string,
	members: string[]
): Promise<Runnable> => {
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
		[
			'system',
			`Given the conversation above, who should act next? Or should we FINISH? Select one of: ${options.join(
				', '
			)}`
		]
	]);

	const supervisor = prompt
		.pipe(
			llm.bindTools([routeTool], {
				tool_choice: 'route'
			})
		)
		.pipe(new JsonOutputToolsParser())
		// select the first one
		.pipe((x: any) => ({
			next: x[0].args.next,
			instructions: x[0].args.instructions
		}));

	return supervisor;
};
