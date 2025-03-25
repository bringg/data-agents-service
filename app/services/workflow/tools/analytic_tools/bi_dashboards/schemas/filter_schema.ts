import { WidgetDataFilter } from '@bringg/types';
import { z } from 'zod';

//@ts-ignore
export const filterSchema: z.ZodType<WidgetDataFilter> = z.object({
	comparison: z.array(z.string()).length(2).optional(),
	dates: z.array(z.string()).length(2),
	teams: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message: 'Team must be a numeric string that represents the team ID.'
			})
		)
		.optional(),
	parents: z.array(z.string()).optional(),
	drivers: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message: 'Driver must be a numeric string that represents the driver ID.'
			})
		)
		.optional(),
	fleets: z.array(z.string()).optional(),
	tags: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message: 'Tag must be a numeric string that represents the Tag ID.'
			})
		)
		.optional(),
	taskTypes: z.array(z.enum(['PICK_UP', 'RETURNS', 'DROP_OFF', 'PICK_UP_AND_DROP_OFF'])).optional(),
	servicePlans: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message: 'ServicePlan must be a numeric string that represents the ServicePlan ID.'
			})
		)
		.optional(),
	merchants: z.array(z.string()).optional()
});
