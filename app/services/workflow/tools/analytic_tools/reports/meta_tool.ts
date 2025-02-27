import { config, logger } from '@bringg/service';
import { CubeMetaDto } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { SuperWorkflow } from '../../../graphs/super_graph';

const toolSchema = {
	name: 'meta_tool',
	description: 'Returns metadata about all available cubes, including the measures and dimensions they provide.'
};

const _metaToolHttp = tool(async () => {
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
		logger.error('Error getting meta');
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data: CubeMetaDto = await response.json();

	return data;
}, toolSchema);

const _metaToolRpc = tool(async (_, config: RunnableConfig) => {
	const { merchant_id, user_id } = config.configurable as { merchant_id: number; user_id: number };

	try {
		const meta: CubeMetaDto = await SuperWorkflow.rpcClient.getOwnFleetPrestoDbMeta({
			payload: {
				userContext: { userId: user_id, merchantId: merchant_id }
			}
		});

		return meta;
	} catch (e) {
		logger.error('Error getting meta', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
}, toolSchema);

export const metaTool = !IS_DEV ? _metaToolRpc : _metaToolHttp;
