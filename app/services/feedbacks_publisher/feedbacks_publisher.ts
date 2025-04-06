import { KafkaClient } from '@bringg/service-utils';
import { AIAnalystFeedback } from '../../domains/feedback/types';
import { config } from '@bringg/service';

export class FeedbackPublisher {
	public static async publish(feedback: AIAnalystFeedback) {
		await KafkaClient.getInstance().publishData(feedback, config.kafkaFeedbackTopic, feedback.thread_id);
	}
}
