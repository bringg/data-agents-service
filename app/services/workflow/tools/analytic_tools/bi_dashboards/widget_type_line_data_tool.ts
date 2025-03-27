//! NO HTTP ENDPOINT
import { WidgetType } from '@bringg/types';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const widgetTypeLineDataTool = tool(
	async input => {
		const url = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/${WidgetType.LineChart}/widgets-catalog-id/${input.widgetCatalogId}/get-data`;
		const jwt = process.env.analyticsJWT;

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

		return data;
	},
	{
		name: 'widget_type_line_data_tool',
		description:
			'Fetches analytics data for a specific widget catalog item (presented as a line chart) using filters, grouping, and time granularity as needed.',
		schema: z.object({
			widgetCatalogId: z.number()
		}),
		verboseParsingErrors: true
	}
);
