import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { config } from '@bringg/service';
import { filterSchema } from './schemas';
import { WidgetType } from '@bringg/types';

export const widgetTypeDoubleYAxisDataTool = tool(
	async input => {
		const { widgetCatalogId, ...body } = input;

		const url = `https://us2-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/${WidgetType.DoubleYAxisChart}/widgets-catalog-id/${input.widgetCatalogId}/get-data`;
		const jwt = config.get('analyticsJWT');

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
		})
	}
);
