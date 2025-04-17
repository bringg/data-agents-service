export type InsightFeedbackRequest = Omit<AIAnalystFeedback, 'merchant_id' | 'user_id' | 'created_at'>;

export type AIAnalystFeedback = {
	merchant_id: number;
	user_id: number;
	created_at: string;
	thread_id: string;
	rank: number;
	tags: string[];
	text?: string;
};
