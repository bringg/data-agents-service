import { logger } from '@bringg/service';
import { BinaryFilter, DbQueryResultRow, Filter, Query, UserContext } from '@bringg/types';

import { IS_DEV } from '../../../../../../common/constants';
import { DEPENDENT_CUBES } from '../constants/cube_constants';
import { executeLoadQueryHttp } from './http_utils';
import { executeLoadQueryRpc } from './rpc_utils';

type ValidationQuery = {
	dimensions: string[];
	timeDimensions?: Array<{
		dimension: string;
		dateRange: [string, string];
	}>;
};

/**
 * Type guard to check if a filter is a binary filter (has values)
 */
const isBinaryFilter = (filter: Filter): filter is Extract<Filter, { values: string[] }> =>
	'values' in filter && filter.operator === 'equals';

/**
 * Creates a validation query with necessary time dimensions for dependent cubes
 * @param member - The filter member to validate
 * @returns A validation query object with appropriate time dimensions
 */
const createValidationQuery = (member: string): ValidationQuery => {
	const cube = member.split('.')[0];
	const baseQuery: ValidationQuery = {
		dimensions: [member]
	};

	// If querying a dependent cube, add Tasks.createdAt time dimension for the last 180 days
	if (DEPENDENT_CUBES.includes(cube as (typeof DEPENDENT_CUBES)[number])) {
		const today = new Date();
		const pastDate = new Date();

		pastDate.setDate(today.getDate() - 179);

		baseQuery.timeDimensions = [
			{
				dimension: 'Tasks.createdAt',
				dateRange: [pastDate.toISOString(), today.toISOString()]
			}
		];
	}

	return baseQuery;
};

/**
 * Validates a single filter's values
 * @param validationQuery - The validation query to execute
 * @param query - The original query containing filters
 * @param config - Optional configuration for RPC calls
 * @throws Error if the filter value is invalid
 */
const validateSingleFilter = async (
	validationQuery: ValidationQuery,
	query: Query,
	userContext?: UserContext
): Promise<void> => {
	const data = IS_DEV
		? await executeLoadQueryHttp(validationQuery)
		: await executeLoadQueryRpc(validationQuery, userContext!);

	const validValues = new Set(data.data.map((row: DbQueryResultRow) => String(row[validationQuery.dimensions[0]])));

	const filter = query.filters?.find(
		(f: Filter) => isBinaryFilter(f) && f.member === validationQuery.dimensions[0]
	) as BinaryFilter | undefined;

	if (filter) {
		const hasValidValue = filter.values.some((value: string) => validValues.has(value));

		if (!hasValidValue) {
			const firstTenValues = Array.from(validValues).slice(0, 10);
			const remainingCount = Math.max(0, validValues.size - 10);
			const remainingText = remainingCount > 0 ? ` and ${remainingCount} more values` : '';

			throw new Error(
				`Invalid filter value for ${
					filter.member
				}. It seems like you forgot using the 2 step process for filters. Here some filter values I found for you that you can use again: ${firstTenValues.join(
					', '
				)}${remainingText}`
			);
		}
	}
};

/**
 * Validates that all filter values exist in the data
 * @param query - The query containing filters to validate (not modified)
 * @param config - Optional configuration for RPC calls
 * @returns true if all filters are valid
 * @throws Error if any filter value is invalid
 */
export const validateFilterValues = async (query: Query, userContext?: UserContext): Promise<boolean> => {
	try {
		if (!query.filters?.length) {
			return true;
		}

		// Get all the filter members that are being filtered on => create a validation query object for each
		const validationQueries = query.filters.reduce<ValidationQuery[]>((acc, filter) => {
			if (isBinaryFilter(filter)) {
				return [...acc, createValidationQuery(filter.member)];
			}

			return acc;
		}, []);

		// If there are no validation queries, return true
		if (validationQueries.length === 0) {
			return true;
		}

		// Create array of validation promises
		const validationPromises = validationQueries.map(validationQuery =>
			validateSingleFilter(validationQuery, query, userContext)
		);

		// Wait for all validations to complete
		await Promise.all(validationPromises);

		return true;
	} catch (error) {
		logger.error(`Validation failed: ${error}`);
		throw error;
	}
};
