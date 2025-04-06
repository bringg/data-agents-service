import { logger, ReqValidator } from '@bringg/service';
import { Context, Path, POST, PreProcessor, ServiceContext } from 'typescript-rest';

import { conditionalSecurity } from '../../common/utils/decorator_utils';
import { validateUser } from '../../common/utils/user_validation';
import { FeedbackPublisher } from '../../services/feedbacks_publisher/feedbacks_publisher';
import { InsightFeedbackRequest } from './types';
import { saveFeedbackRules } from './validation/feedback_validation';

@Path('feedback')
@conditionalSecurity()
export class FeedbackController {
	@Context
	private context: ServiceContext;

	@POST
	@PreProcessor(ReqValidator.validate(saveFeedbackRules))
	@Path('/')
	public async saveFeedback(insightFeedbackRequest: InsightFeedbackRequest) {
		const { merchantId, userId } = validateUser(this.context);
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
