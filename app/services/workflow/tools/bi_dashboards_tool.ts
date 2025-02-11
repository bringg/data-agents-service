import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ANALYTICS_SERVICE_TOOL_PROMPT } from '../prompts';

export const biDashboardsTool = new DynamicStructuredTool({
	name: 'bi_dashboards_tool',
	description: '',
	schema: z.object({
		data: z
			.object({
				label: z.string(),
				value: z.number()
			})
			.array()
	}),
	func: async ({ data }) => {}
});
