import { WorkflowStateType } from '../graph/types';

export const analyticsSupervisor = async (state: WorkflowStateType) => {
	const lastMsg = state.messages[state.messages.length - 1]?.content || '';
	// Route based on content: if the message includes "report", go to Reports Agent
	if (lastMsg.toLowerCase().includes('report')) {
		return { next: 'reports_agent' };
	} else {
		return { next: 'analytics_agent' };
	}
};
