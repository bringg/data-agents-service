import { logger } from '@bringg/service';
import { PrestoDbLoadResultDto, Query } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';

import { SuperWorkflow } from '../../../../graphs/super_graph';

export const executeLoadQueryRpc = async (query: Query, config: RunnableConfig) => {
	const { merchant_id, user_id } = config.configurable as { merchant_id: number; user_id: number };

	try {
		const queryResult: PrestoDbLoadResultDto = await SuperWorkflow.rpcClient.ownFleetPrestoDbLoad({
			payload: {
				userContext: { userId: user_id, merchantId: merchant_id },
				query
			}
		});

		if ('data' in queryResult) {
			return { ...queryResult.data, length: queryResult.data.length };
		}
	} catch (e) {
		logger.error('Error getting reports load', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};
