import { config } from '@bringg/service';
import { tool } from '@langchain/core/tools';

export const metaTool = tool(
	async () => {
		const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/meta';
		const jwt = config.get('analyticsJWT');

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

		return data;
	},
	{
		name: 'meta_tool',
		description: 'Returns metadata about all available cubes, including the measures and dimensions they provide.'
	}
);
