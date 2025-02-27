import { config, logger } from '@bringg/service';
import { DbQueryResult,PrestoDbLoadResultDto } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';
import { SuperWorkflow } from 'app/services/workflow/graphs/super_graph';
import { z } from 'zod';

import { IS_DEV } from '../../../../../common/constants';
import { QueryZodSchema } from './schemas/load_tool_schemas';

const toolSchema = {
	name: 'load_tool',
	description:
		'Executes a query against the metadata. Include dimensions, measures, filters, or date range in the request body.',
	schema: z.object({
		query: QueryZodSchema
	})
};

export const _loadToolHttp = tool(async input => {
	const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/load';
	const jwt = config.get('analyticsJWT');

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(input)
	});

	if (!response.ok) {
		logger.error('Error getting meta');
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return { ...data, length: data.data.length };
}, toolSchema);

const _loadToolRpc = tool(async ({ query }, config: RunnableConfig) => {
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
		logger.error('Error getting meta', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
}, toolSchema);

export const loadTool = !IS_DEV ? _loadToolRpc : _loadToolHttp;
