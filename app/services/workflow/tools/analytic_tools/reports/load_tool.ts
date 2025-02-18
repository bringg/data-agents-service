import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { query } from './schemas/load_tool_schemas';

export const loadTool = tool(
	async input => {
		const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/load';
		const jwt = '';
		console.log('THIS IS THE INPUT');
		console.log(input);
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query: input })
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log(data);
		return data;
	},
	{
		name: 'load_tool',
		description:
			'Executes a query against the metadata. Include dimensions, measures, filters, or date range in the request body.',
		schema: z.object({
			measures: z
				.array(z.string())
				.optional()
				.describe('list of relevant measures to the query provided by meta_tool in the cubes list'),
			dimensions: z
				.array(z.string())
				.optional()
				.describe('list of relevant dimensions to the query provided by meta_tool in the cubes list')
		})
	}
);
