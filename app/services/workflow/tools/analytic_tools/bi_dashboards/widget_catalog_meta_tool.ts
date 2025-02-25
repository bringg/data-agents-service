import { tool } from '@langchain/core/tools';
import { config } from '@bringg/service';

const getDescriptionsDict = async () => {
	const url = 'https://app.bringg.com/apps/analytics/reports/locale/en.json';

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return data;
};

export const widgetCatalogMetaTool = tool(
	async () => {
		const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/dashboards/widgets-catalog-items';
		const jwt = config.get('jwt');

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const descriptionsDict = await getDescriptionsDict();

		const populatedDescriptionData = data.data.map((item: any) => ({
			...item,
			defaultDescription: descriptionsDict[item.defaultDescription]
		}));

		return populatedDescriptionData;
	},
	{
		name: 'widget_catalog_meta_tool',
		description: 'Returns a list of widget catalog items for the “Own Fleet” dashboard (dashboardType=0).'
	}
);
