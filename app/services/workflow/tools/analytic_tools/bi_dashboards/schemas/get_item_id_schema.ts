import { z } from 'zod';

export const getItemIdInputSchema = z.object({
	type: z.enum(['drivers', 'teams', 'tags', 'servicePlans', 'fleets']),
	name: z.string().optional()
});

export type GetItemIdInput = z.infer<typeof getItemIdInputSchema>;
