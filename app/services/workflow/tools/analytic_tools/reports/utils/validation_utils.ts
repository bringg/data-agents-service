import { logger } from '@bringg/service';
import { BinaryFilter, DbQueryResultRow, Filter, Query, UserContext } from '@bringg/types';
import { FormattedMetaResponse } from 'app/services/workflow/types';

import { IS_DEV } from '../../../../../../common/constants';
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
 * Finds the main cube for a given dependent cube
 * @param dependentCube - The dependent cube name
 * @param meta - The formatted meta response containing cube dependencies
 * @returns The main cube name or null if not found
 */
const findMainCubeForDependentCube = (dependentCube: string, meta: FormattedMetaResponse): string | null => {
	for (const [mainCube, dependentCubes] of Object.entries(meta.cubeDependencies)) {
		if (dependentCubes.includes(dependentCube)) {
			return mainCube;
		}
	}

	return null;
};

/**
 * Creates a validation query with necessary time dimensions for dependent cubes
 * @param member - The filter member to validate
 * @param meta - The formatted meta response containing cube dependencies
 * @returns A validation query object with appropriate time dimensions
 */
const createValidationQuery = (member: string, meta: FormattedMetaResponse): ValidationQuery => {
	const cube = member.split('.')[0];
	const baseQuery: ValidationQuery = {
		dimensions: [member]
	};

	// Check if the cube is a dependent cube by looking at the meta information
	const mainCube = findMainCubeForDependentCube(cube, meta);
	const isDependentCube = mainCube !== null;

	// If querying a dependent cube, add the main cube's createdAt time dimension for the last 180 days
	if (isDependentCube && mainCube) {
		const today = new Date();
		const pastDate = new Date();

		pastDate.setDate(today.getDate() - 179);

		baseQuery.timeDimensions = [
			{
				dimension: `${mainCube}.createdAt`,
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
 * @param userContext - Optional user context for RPC calls
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
				`Invalid filter value for ${filter.member}.
				It seems like you forgot using the 2 step process for filters.
				The query I ran to get the valid values is: 
				\`\`\`json
				${JSON.stringify(validationQuery)}
				\`\`\`
				Here are some VALID filter values for ${filter.member} that you can use: ${firstTenValues.join(', ')}${remainingText}`
			);
		}
	}
};

/**
 * Validates that all filter values exist in the data
 * @param query - The query containing filters to validate (not modified)
 * @param meta - The formatted meta response containing cube dependencies
 * @param userContext - Optional user context for RPC calls
 * @returns true if all filters are valid
 * @throws Error if any filter value is invalid
 */
export const validateFilterValues = async (
	query: Query,
	meta: FormattedMetaResponse,
	userContext?: UserContext
): Promise<boolean> => {
	try {
		if (!query.filters?.length) {
			return true;
		}

		// Get all the filter members that are being filtered on => create a validation query object for each
		const validationQueries = query.filters.reduce<ValidationQuery[]>((acc, filter) => {
			if (isBinaryFilter(filter)) {
				return [...acc, createValidationQuery(filter.member, meta)];
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
		logger.error(`Filter validation failed: ${error}`);
		throw error;
	}
};

/**
 * Validates that the query follows the cube dependency rules
 * @param query - The query to validate
 * @param meta - The formatted meta response containing cube dependencies
 * @returns true if the query follows the cube dependency rules
 * @throws Error if the query violates cube dependency rules
 */
export const validateCubeDependencies = (query: Query, meta: FormattedMetaResponse): void => {
	// Extract all cube names from the query
	const allFields = [
		...(query.dimensions || []),
		...(query.measures || []),
		...(query.timeDimensions?.map(td => td.dimension) || []),
		...(query.segments || []),
		...(query.filters?.map(f => ('member' in f ? f.member : '')).filter(Boolean) || []),
		...(query.order?.map(([field]) => field) || [])
	].filter(Boolean); // Filter out any undefined or empty strings

	const cubeNames = new Set(allFields.map(field => field.split('.')[0]));

	// Check if we have fields from multiple main cubes
	const mainCubes = Object.keys(meta.cubeDependencies);
	const usedMainCubes = mainCubes.filter(mainCube => cubeNames.has(mainCube));

	if (usedMainCubes.length > 1) {
		throw new Error(
			`Invalid query: You cannot include fields from multiple main cubes (${usedMainCubes.join(', ')}). ` +
				`Please select fields from only one main cube.`
		);
	}

	if (usedMainCubes.length === 0) {
		throw new Error(
			`Invalid query: You cannot query only dependent cube fields without including at least one field from a main cube. ` +
				`Please include at least one field from one of these main cubes: ${mainCubes.join(', ')}.`
		);
	}

	// If we have a main cube, check if all dependent cubes are valid for that main cube
	const mainCube = usedMainCubes[0];
	const validDependentCubes = meta.cubeDependencies[mainCube];

	// Check if any cube in the query is not the main cube or a valid dependent cube
	const invalidCubes = Array.from(cubeNames).filter(cube => cube !== mainCube && !validDependentCubes.includes(cube));

	if (invalidCubes.length > 0) {
		throw new Error(
			`Invalid query: The following cubes (${invalidCubes.join(
				', '
			)}) are not valid dependent cubes for ${mainCube}. ` +
				`Valid dependent cubes for ${mainCube} are: ${validDependentCubes.join(', ')}.`
		);
	}
};

/**
 * Validates that no-mixes of dimensions and measures are used
 * @param query - The query to validate
 * @param meta - The formatted meta response containing cube dependencies
 * @returns true if the query is valid
 * @throws Error if the query is invalid
 */
export const validateNoMixesOfDimensionsAndMeasures = (
	query: Query,
	{ measures, dimensions }: FormattedMetaResponse
): void => {
	// Extract all cube names from the query
	const allDimensions = [
		...(query.dimensions || []),
		...(query.timeDimensions?.map(td => td.dimension) || [])
	].filter(Boolean); // Filter out any undefined or empty strings

	const allMeasures = [...(query.measures || [])].filter(Boolean); // Filter out any undefined or empty strings

	// If there are no dimensions or measures, the validation fails
	if (!allDimensions.length && !allMeasures.length) {
		throw new Error('Invalid query: You must include at least one dimension or measure.');
	}

	// Create sets for O(1) lookup
	const dimensionsSet = new Set(dimensions);
	const measuresSet = new Set(measures);

	// Check if any dimension is a measure or a measure is a dimension
	const mixedDimensions = allDimensions.filter(field => measuresSet.has(field));
	const mixedMeasures = allMeasures.filter(field => dimensionsSet.has(field));

	if (mixedDimensions.length > 0) {
		throw new Error(
			`Invalid query: The given dimensions in your query are measures: ${mixedDimensions.join(
				', '
			)}. Dimensions should not be used as measures.`
		);
	}

	if (mixedMeasures.length > 0) {
		throw new Error(
			`Invalid query: The given measures in your query are dimensions: ${mixedMeasures.join(
				', '
			)}. Measures should not be used as dimensions.`
		);
	}

	const madeUpDimensions = allDimensions.filter(field => !dimensionsSet.has(field));
	const madeUpMeasures = allMeasures.filter(field => !measuresSet.has(field));

	if (madeUpDimensions.length > 0) {
		throw new Error(
			`Invalid query: The following dimensions do not exist in the meta message: ${madeUpDimensions.join(', ')}.`
		);
	}

	if (madeUpMeasures.length > 0) {
		throw new Error(
			`Invalid query: The following measures do not exist in the meta message: ${madeUpMeasures.join(', ')}.`
		);
	}
};

/**
 * Main validation function that checks both filter values and cube dependencies
 * @param query - The query to validate
 * @param meta - The formatted meta response containing cube dependencies
 * @param userContext - Optional user context for RPC calls
 * @returns true if the query is valid
 * @throws Error if the query is invalid
 */
export const validateQueryLogic = async (
	query: Query,
	meta: FormattedMetaResponse,
	userContext?: UserContext
): Promise<void> => {
	// First validate cube dependencies
	validateCubeDependencies(query, meta);

	// Validate no-mixes of dimensions and measures
	validateNoMixesOfDimensionsAndMeasures(query, meta);

	// Then validate filter values
	await validateFilterValues(query, meta, userContext);
};
