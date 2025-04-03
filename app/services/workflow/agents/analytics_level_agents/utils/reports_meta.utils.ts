import { logger } from '@bringg/service';
import { analyticsRpcClient } from '@bringg/service-utils';
import { CubeMetaDto, UserContext } from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';

import { IS_DEV } from '../../../../../common/constants';
import { reportsCubeDependencies } from './reports_cube_dependencies.utils';

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

	return meta;
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

		return meta;
	} catch (e) {
		logger.error('Error getting meta', { error: e });
		throw new Error(`Error getting meta: ${e}`);
	}
};

// Format the meta to be used in the reports builder agent
const _reportsMetaFormat = (meta: CubeMetaDto, cubeDependencies: Record<string, string[]>) => {
	// Create a Map for O(1) lookups of cubes by name
	const cubesMap = new Map(meta.cubes.map(cube => [cube.name, cube]));

	const formattedMeta = {
		cubeDependencies,
		cubes: Object.keys(cubeDependencies)
			.map(mainCube => {
				const cube = cubesMap.get(mainCube);

				if (!cube) {
					return null;
				}

				const dependentCubes = cubeDependencies[mainCube]
					.map(depCubeName => {
						const depCube = cubesMap.get(depCubeName);

						if (!depCube) {
							return null;
						}

						const { dimensions, measures, name, title, segments } = depCube;

						return {
							name,
							title,
							dimensions: dimensions.map(({ name, description, title }) => ({
								name,
								description,
								title
							})),
							measures: measures.map(({ name, description, title }) => ({
								name,
								description,
								title
							})),
							segments: segments.map(({ name, title }) => ({
								name,
								title
							}))
						};
					})
					.filter(Boolean);

				const { dimensions, measures, name, title, segments } = cube;

				return {
					name,
					title,
					dimensions: dimensions.map(({ name, description, title }) => ({
						name,
						description,
						title
					})),
					measures: measures.map(({ name, description, title }) => ({
						name,
						description,
						title
					})),
					segments: segments.map(({ name, title }) => ({
						name,
						title
					})),
					dependentCubes
				};
			})
			.filter(Boolean)
	};

	return formattedMeta;
};

export const reportsMeta = async (userContext: UserContext): Promise<string> => {
	const meta = !IS_DEV ? await _reportsMetaRpc(userContext) : await _reportsMetaHttp();

	const cubeDependencies = await reportsCubeDependencies(userContext);

	const formattedMeta = _reportsMetaFormat(meta, cubeDependencies);

	return JSON.stringify(formattedMeta);
};
