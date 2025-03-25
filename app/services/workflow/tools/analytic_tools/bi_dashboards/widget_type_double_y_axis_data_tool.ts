import { WidgetType } from '@bringg/types';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { filterSchema } from './schemas';

export const widgetTypeDoubleYAxisDataTool = tool(
	async input => {
		const { widgetCatalogId, ...body } = input;

		const url = `https://us2-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/${WidgetType.DoubleYAxisChart}/widgets-catalog-id/${widgetCatalogId}/get-data`;
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
		name: 'widget_type_double_y_axis_data_tool',
		description:
			'Fetches analytics data for a specific widget catalog item (presented as a double Y-axis chart) using filters, grouping, and time granularity as needed.',
		schema: z.object({
			widgetCatalogId: z.number(),
			filter: filterSchema,
			timezone: z.string()
		}),
		verboseParsingErrors: true
	}
);
