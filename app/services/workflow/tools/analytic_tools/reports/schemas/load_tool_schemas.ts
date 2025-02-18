import { z } from 'zod';

//@ts-ignore
const filter = z.lazy(() =>
	z.union([
		// Binary filter
		z.object({
			member: z.string(),
			operator: z.union([
				z.literal('equals'),
				z.literal('notEquals'),
				z.literal('contains'),
				z.literal('notContains'),
				z.literal('startsWith'),
				z.literal('endsWith'),
				z.literal('gt'),
				z.literal('gte'),
				z.literal('lt'),
				z.literal('lte'),
				z.literal('inDateRange'),
				z.literal('notInDateRange'),
				z.literal('beforeDate'),
				z.literal('afterDate')
			]),
			values: z.array(z.string())
		}),
		// Unary filter
		z.object({
			member: z.string(),
			operator: z.union([z.literal('set'), z.literal('notSet')]),
			values: z.undefined().optional()
		}),
		// Logical OR filter
		z.object({
			or: z.array(filter)
		}),
		// Logical AND filter
		z.object({
			and: z.array(filter)
		})
	])
);

export const query = z.object({
	measures: z.array(z.string()).optional(),
	dimensions: z.array(z.string()).optional(),
	filters: z.array(filter).optional()
});
