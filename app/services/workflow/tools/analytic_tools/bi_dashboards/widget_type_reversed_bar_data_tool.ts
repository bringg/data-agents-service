import { AnalyticsWidgetData, WidgetType } from '@bringg/types';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { filterSchema } from './schemas';

export const widgetTypeReversedBarDataTool = tool(
	async input => {
		const { widgetCatalogId, limit, order, ...body } = input;

		const url = `https://us2-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/${WidgetType.ReversedBarChart}/widgets-catalog-id/${widgetCatalogId}/get-data`;
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

		const { data }: { data: AnalyticsWidgetData } = await response.json();

		// Rebuild the data object based on limit and order
		if (order === 'desc') {
			data.series[0].data.sort((a, b) => b.y - a.y);
		} else if (order === 'asc') {
			data.series[0].data.sort((a, b) => a.y - b.y);
		}

		// Recalculate the total value
		if (limit && data.number) {
			data.series[0].data = data.series[0].data.slice(0, limit);
			data.number.value = data.series[0].data.reduce((sum, item) => sum + item.y, 0);
		}

		return data;
	},
	{
		name: 'widget_type_reversed_bar_data_tool',
		description:
			'Fetches analytics data for a specific widget catalog item (presented as a reversed bar chart) using filters, grouping, and time granularity as needed.',
		schema: z.object({
			widgetCatalogId: z.number(),
			filter: filterSchema,
			timezone: z.string(),
			groupBy: z.number().int().min(0).max(10).optional(),
			stackedBy: z.number().int().min(0).max(10).optional(),
			limit: z.number().optional(),
			order: z.enum(['asc', 'desc']).optional()
		})
	}
);
