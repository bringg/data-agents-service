// import { Query } from '@bringg/types';
import { z } from 'zod';
/*
 * 1. Enums and helpers
 */

// 'asc' | 'desc'
const QueryOrderSchema = z.enum(['asc', 'desc']);

// TQueryOrderArray = Array<[string, QueryOrder]>
const TQueryOrderArraySchema = z.array(z.tuple([z.string(), QueryOrderSchema]));

/*
 * Filter operator enums
 */
// BinaryOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' ...
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

// UnaryOperator = 'set' | 'notSet'
const UnaryOperatorSchema = z.enum(['set', 'notSet']);

/*
 * Logical filter formats
 */

// We'll define each filter shape, then union them.
const BinaryFilterSchema = z.object({
	member: z.string(),
	operator: BinaryOperatorSchema,
	values: z.array(z.string())
});

const UnaryFilterSchema = z.object({
	member: z.string(),
	operator: UnaryOperatorSchema,
	// `values?: never` translates to a schema that does not allow "values" property
	values: z.undefined().optional()
});

// We'll use z.lazy so these can reference each other for "and" / "or"
type TFilter = z.infer<typeof BinaryFilterSchema> | z.infer<typeof UnaryFilterSchema>;

//@ts-ignore
const FilterSchema: z.ZodType<TFilter> = z.lazy(() =>
	z.union([
		BinaryFilterSchema,
		UnaryFilterSchema,
		z.object({
			or: z.array(FilterSchema)
		}),
		z.object({
			and: z.array(FilterSchema)
		})
	])
);

/*
 * TimeDimensionGranularity = 'hour' | 'day' | 'week' | 'month' | 'year'
 */
const TimeDimensionGranularitySchema = z.enum(['hour', 'day', 'week', 'month', 'year']);

/*
 * DateRange = string | [string, string]
 */
const DateRangeSchema = z.union([z.string(), z.tuple([z.string(), z.string()])]);

/*
 * TimeDimension = {
 *   dimension: string;
 *   granularity?: TimeDimensionGranularity;
 *   dateRange?: DateRange;
 * }
 */
const TimeDimensionSchema = z.object({
	dimension: z.string(),
	granularity: TimeDimensionGranularitySchema.optional(),
	dateRange: DateRangeSchema.optional()
});

/*
 * Query = {
 *   measures?: string[];
 *   dimensions?: string[];
 *   filters?: Filter[];
 *   timeDimensions?: TimeDimension[];
 *   segments?: string[];
 *   limit?: number | null;
 *   offset?: number;
 *   order?: TQueryOrderArray;
 *   timezone?: string;
 *   renewQuery?: boolean;
 *   ungrouped?: boolean;
 * }
 */
export const QueryZodSchema = z.object({
	measures: z.array(z.string()).optional(),
	dimensions: z.array(z.string()).optional(),
	filters: z.array(FilterSchema).optional(),
	timeDimensions: z.array(TimeDimensionSchema).optional(),
	segments: z.array(z.string()).optional(),
	limit: z.number().nullable().optional(),
	offset: z.number().optional(),
	order: TQueryOrderArraySchema.optional(),
	timezone: z.string().optional(),
	renewQuery: z.boolean().optional(),
	ungrouped: z.boolean().optional()
});
