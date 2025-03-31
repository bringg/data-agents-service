import { tool } from '@langchain/core/tools';

export const last180DaysTool = tool(
	async () => {
		const today = new Date();
		const last180Days = new Date(today.getTime() - 178 * 24 * 60 * 60 * 1000);

		// Set start time to 00:00:00
		last180Days.setHours(0, 0, 0, 0);

		// Set end time to 23:59:59
		today.setHours(23, 59, 59, 999);

		// Format dates with time components
		const startDate = last180Days.toISOString().slice(0, 19).replace('T', ' ');
		const endDate = today.toISOString().slice(0, 19).replace('T', ' ');

		return {
			dateRange: [startDate, endDate]
		};
	},
	{
		name: 'last180Days',
		description:
			'Returns date range for the last 180 days in format [YYYY-MM-DD HH:mm:ss], start time at 00:00:00 and end time at 23:59:59'
	}
);
