/**
 * Handles unauthorized access errors for agent operations
 *
 * @param operation - A function that performs the agent operation
 * @returns The result of the operation
 * @throws Error with a specific message if the user is unauthorized
 */
export const handleUnauthorizedAccess = async <T>(operation: () => Promise<T>): Promise<T> => {
	try {
		return await operation();
	} catch (e) {
		if (e instanceof Error && e.message.includes('403')) {
			throw new Error(
				'Current user is not authorized to access this feature. Use other agents to get the data you need.'
			);
		}
		throw e;
	}
};
