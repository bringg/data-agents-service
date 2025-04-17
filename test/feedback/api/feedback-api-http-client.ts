import { InteractiveClients } from '@bringg/service';
import { BaseHttpClient } from '@bringg/test-utils';

import { FeedbackController } from '../../../app/domains/feedback/feedback_controller';
import { InsightFeedbackRequest } from '../../../app/domains/feedback/types';
import { RouteResponse } from '../../__helper__/types';

interface InitParams {
	merchantId: number;
	userId: number;
}

export class FeedbackHttpClient extends BaseHttpClient<InitParams> {
	public override async init({ merchantId, userId }: InitParams): Promise<this> {
		await this.setupWithIdentity({
			configOverride: {
				baseURL: '/feedback'
			},
			identity: {
				merchantId,
				userId,
				audience: InteractiveClients.DASHBOARD_WEB
			}
		});

		return this;
	}

	public async saveFeedback(feedback: InsightFeedbackRequest) {
		return await this.axios.post<RouteResponse<FeedbackController, 'saveFeedback'>>('/', feedback);
	}
}
