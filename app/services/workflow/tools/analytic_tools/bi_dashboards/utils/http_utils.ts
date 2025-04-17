import { WidgetType } from '@bringg/types';

import { getAnalyticsJWT } from '../../../../../../common/utils/jwt.utils';

export const executeWidgetTypeDataHttp = async (input: any, widgetType: WidgetType) => {
	const { widgetCatalogId, ...body } = input;

	const url = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/${widgetType}/widgets-catalog-id/${widgetCatalogId}/get-data`;
	const jwt = getAnalyticsJWT();

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

	return response.json();
};
