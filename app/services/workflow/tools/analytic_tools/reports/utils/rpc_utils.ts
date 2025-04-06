import { logger } from '@bringg/service';
import { analyticsRpcClient } from '@bringg/service-utils';
import { DbQueryResult, PrestoDbLoadResultDto, Query, UserContext } from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';

export const executeLoadQueryRpc = async (
	query: Query,
	userContext: UserContext
): Promise<{ data: DbQueryResult['data']; totalRows: number; cropped: boolean; croppingReason: string | null }> => {
	try {
		const queryResult: PrestoDbLoadResultDto = await analyticsRpcClient.ownFleet.prestoDb.load({
			payload: {
				userContext,
				query
			},
			options: {
				requestId: uuidv4()
			}
		});

		if ('error' in queryResult) {
			throw new Error('The query is too complex for the presto_load endpoint.');
		}

		const totalRows = queryResult?.data ? queryResult.data.length : 0;

		return {
			data: queryResult.data,
			totalRows,
			cropped: totalRows > 500,
			croppingReason: totalRows > 500 ? 'Too many rows, cropped to 500. Work with the first 500 rows.' : null
		};
	} catch (e) {
		logger.error('Error getting reports load', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};
