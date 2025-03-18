import { logger } from '@bringg/service';
import { BinaryFilter, Filter, Query } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';

import { IS_DEV } from '../../../../../../common/constants';
import { executeLoadQueryHttp } from './http_utils';
import { executeLoadQueryRpc } from './rpc_utils';

type ValidationQuery = {
	dimensions: string[];
};

type DataRow = Record<string, string>;

/**
 * Type guard to check if a filter is a binary filter (has values)
 */
const isBinaryFilter = (filter: Filter): filter is Extract<Filter, { values: string[] }> => 'values' in filter;

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
	config?: RunnableConfig
): Promise<void> => {
	const data = IS_DEV
		? await executeLoadQueryHttp(validationQuery)
		: await executeLoadQueryRpc(validationQuery, config!);

	const validValues = new Set(data.data.map((row: DataRow) => row[validationQuery.dimensions[0]]));

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
				}. It seems like you're not using the 2 step process for filters.\nValid values are: ${firstTenValues.join(
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
export const validateFilterValues = async (query: Query, config?: RunnableConfig): Promise<boolean> => {
	try {
		if (!query.filters?.length) {
			return true;
		}

		logger.info('Creating validation queries from filters');

		// Get all the filter members that are being filtered on => create a validation query object for each
		const validationQueries = query.filters.reduce<ValidationQuery[]>((acc, filter) => {
			if (isBinaryFilter(filter)) {
				return [...acc, { dimensions: [filter.member] }];
			}

			return acc;
		}, []);

		// If there are no validation queries, return true
		if (validationQueries.length === 0) {
			return true;
		}

		logger.info('Validating filters in parallel');

		// Create array of validation promises
		const validationPromises = validationQueries.map(validationQuery =>
			validateSingleFilter(validationQuery, query, config)
		);

		// Wait for all validations to complete
		await Promise.all(validationPromises);

		logger.info('All filters validated successfully');

		return true;
	} catch (error) {
		logger.error('Validation failed:', { error, query });
		throw error;
	}
};
