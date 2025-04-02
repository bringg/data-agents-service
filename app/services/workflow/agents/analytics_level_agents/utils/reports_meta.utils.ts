import { logger } from '@bringg/service';
import { analyticsRpcClient } from '@bringg/service-utils';
import { CubeMetaDto, UserContext } from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';

import { IS_DEV } from '../../../../../common/constants';

const _reportsMetaHttp = async () => {
	const url = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/query-engine/own-fleet/presto/meta`;
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

	const formattedMeta = _reportsMetaFormat(meta);

	return formattedMeta;
};

const _reportsMetaRpc = async (userContext: UserContext) => {
	try {
		const meta: CubeMetaDto = await analyticsRpcClient.ownFleet.prestoDb.meta({
			payload: {
				userContext
			},
			options: {
				requestId: uuidv4()
			}
		});

		const formattedMeta = _reportsMetaFormat(meta);

		return formattedMeta;
	} catch (e) {
		logger.error('Error getting meta', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};

// Format the meta to be used in the reports builder agent
const _reportsMetaFormat = (meta: CubeMetaDto) => {
	const formattedMeta = meta.cubes.map(({ dimensions, measures, name, title, segments }) => ({
		name,
		title,
		dimensions: dimensions.map(({ name, description, title }) => ({ name, description, title })),
		measures: measures.map(({ name, description, title }) => ({ name, description, title })),
		segments: segments.map(({ name, title }) => ({ name, title }))
	}));

	return formattedMeta;
};

export const reportsMeta = async (userContext: UserContext): Promise<string> => {
	const meta = !IS_DEV ? await _reportsMetaRpc(userContext) : await _reportsMetaHttp();

	return JSON.stringify(meta);
};
