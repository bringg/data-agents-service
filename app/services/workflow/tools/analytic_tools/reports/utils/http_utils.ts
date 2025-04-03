import { logger } from '@bringg/service';
import { DbQueryResult, PrestoDbLoadResultDto, Query } from '@bringg/types';

const BASE_URL = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/load`;

export const executeLoadQueryHttp = async (
	query: Query
): Promise<{ data: DbQueryResult['data']; totalRows: number; cropped: boolean; croppingReason: string | null }> => {
	const jwt = process.env.analyticsJWT;

	const response = await fetch(BASE_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query })
	});

	if (!response.ok) {
		const error = await response.json();

		logger.error(`Error getting reports via presto_load, Error: ${JSON.stringify(error)}`);

		throw new Error(
			`The query is wrong. You either: 
			1. included fields from two different main cubes 
			2. included a dependent cube field without a main cube field. 
			3. mixed between dimensions and measures.

			Error: ${JSON.stringify(error)}`
		);
	}

	const data = (await response.json()) as PrestoDbLoadResultDto;

	if ('error' in data) {
		throw new Error('The query is too complex for the presto_load endpoint.');
	}

	const totalRows = data?.data ? data.data.length : 0;

	return {
		data: totalRows > 500 ? data.data.slice(0, 500) : data.data,
		totalRows,
		cropped: totalRows > 500,
		croppingReason: totalRows > 500 ? 'Too many rows, cropped to 500. Work with the first 500 rows.' : null
	};
};
