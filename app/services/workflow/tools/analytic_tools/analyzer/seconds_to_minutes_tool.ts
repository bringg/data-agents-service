import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Tool that converts seconds to a formatted time string in HH:mm:ss format
 */
export const secondsToMinutesTool = tool(
	({ seconds }: { seconds: number }) => {
		// Calculate hours, minutes, and remaining seconds
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		// Format with leading zeros
		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

		// Return formatted string
		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	},
	{
		name: 'seconds_to_minutes',
		description: 'Converts seconds to a formatted time string in HH:mm:ss format',
		schema: z.object({
			seconds: z.number().int().nonnegative().describe('Number of seconds to convert to HH:mm:ss format')
		})
	}
);
