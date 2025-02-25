import { z } from 'zod';
import { WidgetDataFilter } from '@bringg/types';

export const filterSchema: z.ZodType<WidgetDataFilter> = z.object({
	comparison: z.tuple([z.string(), z.string()]).optional(),
	dates: z.tuple([z.string(), z.string()]),
	teams: z.array(z.string()).optional(),
	parents: z.array(z.string()).optional(),
	drivers: z.array(z.string()).optional(),
	fleets: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	taskTypes: z.array(z.string()).optional(),
	servicePlans: z.array(z.string()).optional(),
	merchants: z.array(z.string()).optional()
});
