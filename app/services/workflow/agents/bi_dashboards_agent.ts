import { WorkflowStateType } from '../graph/types';

export const biDashboardsAgent = async (state: WorkflowStateType) => {
	// Use the Analytics API Tool to process analytics-related queries

	return {
		messages: [
			new HumanMessage({
				content: 'Analytics Agent: Processed analytics data using Analytics API Tool.'
			})
		]
	};
};
