import { Context, POST, Path, PreProcessor, Security, ServiceContext } from 'typescript-rest';

import { FeedbackPublisher } from '../../services/feedbacks_publisher/feedbacks_publisher';
import { logger, ReqValidator } from '@bringg/service';
import { saveFeedbackRules } from './validation/feedback_validation';
import { UserContext } from '@bringg/types';
import { InsightFeedbackRequest } from './types';

@Path('feedback')
@Security('*', 'bringg-jwt')
export class FeedbackController {
	@Context
	private context: ServiceContext;

	@POST
	@Security('*', 'bringg-jwt')
	@PreProcessor(ReqValidator.validate(saveFeedbackRules))
	@Path('/')
	public async saveFeedback(insightFeedbackRequest: InsightFeedbackRequest) {
		const { merchantId, userId } = this.context.request.user as UserContext;
		const requestId = this.context.request.get('x-request-id');

		const logMeta = {
			merchant_id: merchantId,
			request_id: requestId
		};

		logger.info('Saving feedback', { ...logMeta, params: { insightFeedbackRequest } });

		FeedbackPublisher.publish({
			...insightFeedbackRequest,
			merchant_id: merchantId,
			user_id: userId,
			created_at: new Date().toISOString()
		}).catch(error => {
			logger.error('Failed to publish feedback', { ...logMeta, error });
		});

		return { success: true };
	}
}
