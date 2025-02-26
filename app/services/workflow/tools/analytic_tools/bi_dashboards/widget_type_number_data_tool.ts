import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { filterSchema } from './schemas/filter_schema';
import { config } from '@bringg/service';

export const widgetTypeNumberDataTool = tool(
	async input => {
		const url = `https://us2-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widgets-catalog-items/${input.widgetCatalogId}/get-data?widget_id=111965`;
		const jwt = config.get('analyticsJWT');

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
		name: 'widget_type_number_data_tool',
		description:
			'Fetches analytics data for a specific widget catalog item (presented as a number chart) using filters, grouping, and time granularity as needed.',
		schema: z.object({
			widgetCatalogId: z.number(),
			filter: filterSchema,
			timezone: z.string()
		})
	}
);
