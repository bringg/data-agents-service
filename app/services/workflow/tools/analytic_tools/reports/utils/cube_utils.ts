import { Query } from '@bringg/types';

import { DEPENDENT_CUBES } from '../constants/cube_constants';

/**
 * Extracts the cube name from a field string
 * @param field - The field string in format "cube.field"
 * @returns The cube name if it's a dependent cube, null otherwise
 */
export const getCubeFromField = (field: string): string | null => {
	const cube = field.split('.')[0];

	return DEPENDENT_CUBES.includes(cube as (typeof DEPENDENT_CUBES)[number]) ? cube : null;
};

/**
 * Checks if any field in the array is from the Tasks cube
 * @param fields - Array of field strings
 * @returns true if any field starts with "Tasks."
 */
export const hasTasksCubeField = (fields: string[] | undefined): boolean => {
	if (!fields) {
		return false;
	}

	return fields.some(field => field.startsWith('Tasks.'));
};

/**
 * Gets all unique cube names used in a query across all fields
 * @param query - The query to analyze
 * @returns Set of unique cube names
 */
export const getAllCubeFields = (query: Query): Set<string> => {
	const cubes = new Set<string>();

	// Check measures
	if (query.measures) {
		query.measures.forEach(field => {
			const cube = getCubeFromField(field);

			if (cube) {
				cubes.add(cube);
			}
		});
	}

	// Check dimensions
	if (query.dimensions) {
		query.dimensions.forEach(field => {
			const cube = getCubeFromField(field);

			if (cube) {
				cubes.add(cube);
			}
		});
	}

	// Check filters
	if (query.filters) {
		query.filters.forEach(filter => {
			if ('member' in filter) {
				const cube = getCubeFromField(filter.member);

				if (cube) {
					cubes.add(cube);
				}
			}
		});
	}

	// Check timeDimensions
	if (query.timeDimensions) {
		query.timeDimensions.forEach(timeDim => {
			const cube = getCubeFromField(timeDim.dimension);

			if (cube) {
				cubes.add(cube);
			}
		});
	}

	// Check order
	if (query.order) {
		query.order.forEach(([field]) => {
			const cube = getCubeFromField(field);

			if (cube) {
				cubes.add(cube);
			}
		});
	}

	// Check segments
	if (query.segments) {
		query.segments.forEach(field => {
			const cube = getCubeFromField(field);

			if (cube) {
				cubes.add(cube);
			}
		});
	}

	return cubes;
};
