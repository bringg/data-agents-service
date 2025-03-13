import { logger } from '@bringg/service';
import { CubeMetaDto } from '@bringg/types';

import { IS_DEV } from '../../../../../common/constants';
import { SuperWorkflow } from '../../../graphs/super_graph';

const _reportsMetaHttp = async () => {
	const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/meta';
	const jwt = process.env.analyticsJWT;

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

	const meta: CubeMetaDto = await response.json();

	return meta;
};

const _reportsMetaRpc = async (merchantId: number, userId: number) => {
	try {
		const meta: CubeMetaDto = await SuperWorkflow.rpcClient.getOwnFleetPrestoDbMeta({
			payload: {
				userContext: { userId, merchantId }
			}
		});

		return meta;
	} catch (e) {
		logger.error('Error getting meta', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};

export const reportsMeta = async (merchantId: number, userId: number): Promise<string> => {
	const meta = !IS_DEV ? await _reportsMetaRpc(merchantId, userId) : await _reportsMetaHttp();

	return JSON.stringify(meta);
};
