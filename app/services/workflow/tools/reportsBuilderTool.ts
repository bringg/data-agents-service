import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { REPORTS_BUILDER_TOOL_PROMPT } from '../prompts';

export const reportsBuilderTool = tool(async () => {}, {
	name: 'ReportsBuilder',
	description: REPORTS_BUILDER_TOOL_PROMPT,
	schema: z.object({
		query: z.string().describe('The search query'),
		n: z.number().optional().default(10).describe('Number of results to return')
	})
});
