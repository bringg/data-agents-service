import { logger } from '@bringg/service';
import { DbQueryResult, PrestoDbLoadResultDto, Query } from '@bringg/types';

import { getAnalyticsJWT } from '../../../../../../common/utils/jwt.utils';

const BASE_URL = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/load`;

const MAX_RETRIES = 12; // 1 minute total (5 seconds * 12)
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function makeRequest(query: Query, jwt: string, requestId?: string | null): Promise<Response> {
	return fetch(BASE_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json',
			...(requestId && { 'X-Request-Id': requestId })
		},
		body: JSON.stringify({ query })
	});
}

export const executeLoadQueryHttp = async (
	query: Query
): Promise<{ data: DbQueryResult['data']; totalRows: number; cropped: boolean; croppingReason: string | null }> => {
	const jwt = getAnalyticsJWT();
	let retryCount = 0;
	let requestId: string | null = null;

	while (retryCount <= MAX_RETRIES) {
		const response: Response = await makeRequest(query, jwt, requestId);

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

		// Get or update the request ID
		requestId = requestId || response.headers.get('X-Request-Id');
		const data = (await response.json()) as PrestoDbLoadResultDto;

		// If we get a continue wait response, wait and retry
		if ('error' in data && data.error === 'Continue wait') {
			logger.info(`Query in progress, waiting 5 seconds before retry. Attempt ${retryCount + 1}/${MAX_RETRIES}`);
			await sleep(RETRY_DELAY);
			retryCount++;
			continue;
		}

		// If we get an error that's not continue wait, throw it
		if ('error' in data) {
			logger.error(`Query failed with error: ${data.error}`);
			throw new Error(`Query failed: ${data.error}`);
		}

		// If we get here, we have a successful response
		const totalRows = data?.data?.length || 0;

		return {
			data: totalRows > 500 ? data.data.slice(0, 500) : data.data,
			totalRows,
			cropped: totalRows > 500,
			croppingReason: totalRows > 500 ? 'Too many rows, cropped to 500. Work with the first 500 rows.' : null
		};
	}

	// If we get here, we've exceeded our retry limit
	throw new Error(`Query timed out after ${MAX_RETRIES} retries (${MAX_RETRIES * 5} seconds)`);
};
