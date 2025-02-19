import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { QueryZodSchema } from './schemas/load_tool_schemas';

export const loadTool = tool(
	async input => {
		const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/load';
		const jwt = '';

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(input)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return { ...data, length: data.data.length };
	},
	{
		name: 'load_tool',
		description:
			'Executes a query against the metadata. Include dimensions, measures, filters, or date range in the request body.',
		schema: z.object({
			query: z.object({
				measures: z.array(z.string()).optional(),
				dimensions: z.array(z.string()).optional(),
				// filters: z.array(FilterSchema).optional(),
				// timeDimensions: z
				// 	.array(
				// 		z.object({
				// 			dimension: z.string(),
				// 			granularity: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
				// 			dateRange: z.union([z.string(), z.tuple([z.string(), z.string()])]).optional()
				// 		})
				// 	)
				// 	.optional(),
				segments: z.array(z.string()).optional(),
				limit: z.number().optional(),
				offset: z.number().optional(),
				// order: z.array(z.tuple([z.string(), z.enum(['asc', 'desc'])])).optional(),
				timezone: z.string().optional(),
				renewQuery: z.boolean().optional(),
				ungrouped: z.boolean().optional()
			})
		})
	}
);
