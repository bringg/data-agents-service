//! NO HTTP ENDPOINT
import { WidgetType } from '@bringg/types';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { filterSchema } from './schemas';

export const widgetTypeDonutDataTool = tool(
	async input => {
		const { widgetCatalogId, ...body } = input;

		const url = `https://us2-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/${WidgetType.DonutChart}/widgets-catalog-id/${widgetCatalogId}/get-data`;
		const jwt = process.env.analyticsJWT;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return data;
	},
	{
		name: 'widget_type_donut_data_tool',
		description:
			'Fetches analytics data for a specific widget catalog item (presented as a donut chart) using filters, grouping, and time granularity as needed.',
		schema: z.object({
			widgetCatalogId: z.number(),
			filter: filterSchema,
			timezone: z.string(),
			useTimeDimension: z.boolean(),
			groupBy: z.number().int().min(0).max(10).optional(),
			stackedBy: z.number().int().min(0).max(10).optional(),
			granularity: z.number().int().min(0).max(3).optional()
		}),
		verboseParsingErrors: true
	}
);
