import { logger } from '@bringg/service';
import { analyticsRpcClient } from '@bringg/service-utils';
import { ReportCoreObject, UserContext } from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';

import { IS_DEV } from '../../../../../common/constants';

const _reportsCoreObjectsHttp = async () => {
	const url = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/reports/static/core-objects`;
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

	const { data: reportsCoreObjects }: { data: ReportCoreObject[] } = await response.json();

	return reportsCoreObjects;
};

const _reportsCoreObjectRpc = async (userContext: UserContext) => {
	try {
		//@ts-ignore
		const reportCoreObjects: ReportCoreObject[] = await analyticsRpcClient.ownFleet.prestoDb.template({
			payload: {
				userContext
			},
			options: {
				requestId: uuidv4()
			}
		});

		return reportCoreObjects;
	} catch (e) {
		logger.error('Error getting meta', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};

// Format the core objects to be used in the reports builder agent
// The format is a record of the core object name and the cubes that are linked to it
const _reportsCoreObjectsToCubeDependencies = (reportCoreObjects: ReportCoreObject[]): Record<string, string[]> => {
	const formattedCoreObjects = reportCoreObjects.reduce(
		(acc, { requiredCubes, commonCubes, linkedCubes }) => {
			acc[requiredCubes[0]] = [...commonCubes, ...linkedCubes].filter(cube => cube !== requiredCubes[0]);

			return acc;
		},
		{} as Record<string, string[]>
	);

	return formattedCoreObjects;
};

export const reportsCubeDependencies = async (userContext: UserContext): Promise<Record<string, string[]>> => {
	const reportCoreObjects = !IS_DEV ? await _reportsCoreObjectRpc(userContext) : await _reportsCoreObjectsHttp();

	const cubeDependencies = _reportsCoreObjectsToCubeDependencies(reportCoreObjects);

	return cubeDependencies;
};
