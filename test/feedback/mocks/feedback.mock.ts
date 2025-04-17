import { InsightFeedbackRequest } from '../../../app/domains/feedback/types';

export const MOCK_FEEDBACK: InsightFeedbackRequest = {
	thread_id: 'test-thread-id',
	rank: 5,
	tags: ['helpful', 'accurate'],
	text: 'This was very helpful!'
};

export const MOCK_FEEDBACK_NO_TEXT: InsightFeedbackRequest = {
	thread_id: 'test-thread-id-2',
	rank: 3,
	tags: ['partially-helpful']
};
