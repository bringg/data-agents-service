import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ANALYTICS_SERVICE_TOOL_PROMPT } from '../prompts';

export const analyticsServiceTool = tool(async () => {}, {
	name: 'AnalyticsService',
	description: ANALYTICS_SERVICE_TOOL_PROMPT,
	schema: z.object({
		query: z.string().describe('The search query'),
		n: z.number().optional().default(10).describe('Number of results to return')
	})
});
