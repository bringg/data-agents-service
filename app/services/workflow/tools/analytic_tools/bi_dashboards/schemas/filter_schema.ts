import { WidgetDataFilter } from '@bringg/types';
import { z } from 'zod';

//@ts-ignore
export const filterSchema: z.ZodType<WidgetDataFilter> = z.object({
	comparison: z.array(z.string()).length(2).optional(),
	dates: z.array(z.string()).length(2),
	teams: z.array(z.string()).optional(),
	parents: z.array(z.string()).optional(),
	drivers: z.array(z.string()).optional(),
	fleets: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	taskTypes: z.array(z.string()).optional(),
	servicePlans: z.array(z.string()).optional(),
	merchants: z.array(z.string()).optional()
});
