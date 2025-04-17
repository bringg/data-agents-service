import { config } from '@bringg/service';
import { KafkaClient } from '@bringg/service-utils';

import { AIAnalystFeedback } from '../../domains/feedback/types';

export class FeedbackPublisher {
	public static async publish(feedback: AIAnalystFeedback) {
		await KafkaClient.getInstance().publishData(feedback, config.kafkaFeedbackTopic, feedback.thread_id);
	}
}
