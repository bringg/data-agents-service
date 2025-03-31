import { logger } from '@bringg/service';
import { DbQueryResult, PrestoDbLoadResultDto, Query } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';

import { SuperWorkflow } from '../../../../graphs/super_graph';

export const executeLoadQueryRpc = async (
	query: Query,
	config: RunnableConfig
): Promise<{ data: DbQueryResult['data']; length: number }> => {
	const { merchant_id, user_id } = config.configurable as { merchant_id: number; user_id: number };

	try {
		const queryResult: PrestoDbLoadResultDto = await SuperWorkflow.rpcClient.ownFleetPrestoDbLoad({
			payload: {
				userContext: { userId: user_id, merchantId: merchant_id },
				query
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
