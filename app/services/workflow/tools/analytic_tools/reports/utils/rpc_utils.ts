import { logger } from '@bringg/service';
import { analyticsRpcClient } from '@bringg/service-utils';
import { DbQueryResult, PrestoDbLoadResultDto, Query, UserContext } from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';

export const executeLoadQueryRpc = async (
	query: Query,
	userContext: UserContext
): Promise<{ data: DbQueryResult['data']; length: number }> => {
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

		return { data: queryResult.data, length: queryResult.data.length };
	} catch (e) {
		logger.error('Error getting reports load', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};
