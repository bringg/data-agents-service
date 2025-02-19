import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const biDashboardsTool = tool(async () => {}, {
	name: 'bi_dashboards_tool',
	description: '',
	schema: z.object({
		data: z
			.object({
				label: z.string(),
				value: z.number()
			})
			.array()
	})
});
