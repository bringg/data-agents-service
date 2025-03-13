import { Filter, Query } from '@bringg/types';
import { z, ZodType } from 'zod';

const UnaryOperatorSchema = z.enum(['set', 'notSet']);
const BinaryOperatorSchema = z.enum([
	'equals',
	'notEquals',
	'contains',
	'notContains',
	'startsWith',
	'endsWith',
	'gt',
	'gte',
	'lt',
	'lte',
	'inDateRange',
	'notInDateRange',
	'beforeDate',
	'afterDate'
]);

// Define the basic filter schemas
const _BinaryFilterSchema = z.object({
	member: z.string().describe('member is a measure/dimension that you want to filter on'),
	operator: BinaryOperatorSchema,
	values: z.array(z.string()).describe('Values of the member that you pulled before from load_tool')
});

const _UnaryFilterSchema = z.object({
	member: z.string(),
	operator: UnaryOperatorSchema
	// This schema disallows a `values` property.
});
// Use z.lazy to allow for recursive definitions for logical filters
//@ts-ignore
const _FilterSchema: z.ZodType<Filter> =
	// z.lazy(() =>
	z.union([
		_BinaryFilterSchema,
		_UnaryFilterSchema,
		z.object({
			and: z.array(z.object({}).passthrough()).describe('Array of filters to be ANDed')
		}),
		z.object({
			or: z.array(z.object({}).passthrough()).describe('Array of filters to be ORed')
		})
	]);
// );

// @ts-ignore
export const QueryZodSchema: ZodType<Query> = z.object({
	measures: z.array(z.string()).min(0).optional().describe('Cube measures from the meta_tool'),
	dimensions: z.array(z.string()).min(0).optional().describe('Cube dimensions from the meta_tool'),
	filters: z.array(_FilterSchema).optional(),
	timeDimensions: z
		.array(
			z.object({
				dimension: z.string(),
				granularity: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
				dateRange: z
					.array(z.string())
					.length(2)
					.optional()
					.describe(
						'An array of two strings that represent days like ["2025-03-05 00:00:00", "2025-03-11 23:59:59"]'
					)
			})
		)
		.optional(),
	segments: z.array(z.string()).min(0).optional(),
	limit: z.number().optional(),
	offset: z.number().optional(),
	order: z.array(z.array(z.string()).length(2)).optional(),
	timezone: z.string().optional(),
	renewQuery: z.boolean().optional(),
	ungrouped: z.boolean().optional()
});
