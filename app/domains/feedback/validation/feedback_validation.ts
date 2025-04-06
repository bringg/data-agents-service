import { InsightFeedbackRequest } from '../types';

export const saveFeedbackRules: Record<keyof InsightFeedbackRequest, string[]> = {
	thread_id: ['required', 'string'],
	rank: ['required', 'number'],
	tags: ['required', 'array'],
	text: ['optional', 'string']
};
