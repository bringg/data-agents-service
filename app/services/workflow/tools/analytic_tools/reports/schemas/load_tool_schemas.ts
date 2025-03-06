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
	member: z.string(),
	operator: BinaryOperatorSchema,
	values: z.array(z.string())
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
	measures: z.array(z.string()).min(0).optional(),
	dimensions: z.array(z.string()).min(0).optional(),
	//! GEMINI DOESN'T SUPPORT RECURSIVE SCHEMA
	filters: z.array(_FilterSchema).optional(),
	timeDimensions: z
		.array(
			z.object({
				dimension: z.string(),
				granularity: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
				dateRange: z.union([z.string(), z.array(z.string()).length(2)]).optional()
			})
		)
		.optional(),
	segments: z.array(z.string()).min(0).optional(),
	limit: z.number().optional(),
	offset: z.number().optional(),
	order: z
		.array(z.union([z.string().describe('a dimension or a measure'), z.enum(['asc', 'desc'])]))
		.length(2)
		.refine(arr => typeof arr[0] === 'string', { message: 'First element must be string' })
		.refine(arr => arr[1] === 'asc' || arr[1] === 'desc', {
			message: "Second element must be 'asc' or 'desc'"
		})
		.transform(arr => [arr[0] as string, arr[1] as 'asc' | 'desc'])
		.optional(),
	timezone: z.string().optional(),
	renewQuery: z.boolean().optional(),
	ungrouped: z.boolean().optional()
});
