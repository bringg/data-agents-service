/**
 * Gets the appropriate analytics JWT based on the region
 * @returns The analytics JWT for the current region
 */
export const getAnalyticsJWT = (): string => {
	const region = process.env.REGION?.toLowerCase() || '';

	return region.startsWith('us') ? process.env.US_analyticsJWT || '' : process.env.EU_analyticsJWT || '';
};
