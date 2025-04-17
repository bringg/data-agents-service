import { InsightFeedbackRequest } from '../types';

export const saveFeedbackRules: Record<keyof InsightFeedbackRequest, string[]> = {
	thread_id: ['required', 'string'],
	rank: ['required', 'integer'],
	tags: ['required', 'if_exists_not_empty_array'],
	text: ['string']
};
