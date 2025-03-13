import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const averageTool = tool(
	({ dict1, dict2, order }) => {
		const avgDict = {} as Record<string, number>;

		for (const key in dict1) {
			if (dict1[key] && dict2[key]) {
				avgDict[key] = (dict1[key] + dict2[key]) / 2;
			}
		}

		if (order) {
			const sortedEntries = Object.entries(avgDict).sort(([, a], [, b]) => (order === 'asc' ? a - b : b - a));

			return Object.fromEntries(sortedEntries);
		}

		return avgDict;
	},
	{
		name: 'average_tool',
		description:
			'Takes two dictionaries and returns a dictionary with the average of each key of the values of the two dictionaries.',
		schema: z.object({
			dict1: z.record(z.string(), z.number()),
			dict2: z.record(z.string(), z.number()),
			order: z.enum(['asc', 'desc']).optional()
		})
	}
);
