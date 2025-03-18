import { logger } from '@bringg/service';
import { Query } from '@bringg/types';

const BASE_URL = 'https://us2-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/load';

export const executeLoadQueryHttp = async (query: Query) => {
	const jwt = process.env.analyticsJWT;

	const response = await fetch(BASE_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query: { ...query } })
	});

	// eslint-disable-next-line no-console
	console.log('quering...');
	// eslint-disable-next-line no-console
	console.log(query);
	// eslint-disable-next-line no-console
	console.log(JSON.stringify({ query: { ...query } }));

	if (!response.ok) {
		logger.error(`Error getting reports via presto_load, status: ${response.status}`);

		throw new Error(
			`HTTP error! status: ${response.status}. You might have filled measures inside the dimensions field or vice versa.`
		);
	}

	const data = await response.json();

	return { ...data, length: data?.data ? data.data.length : 0 };
};
