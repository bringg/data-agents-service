import { expect } from 'chai';
import * as sinon from 'sinon';

import { FeedbackPublisher } from '../../../app/services/feedbacks_publisher/feedbacks_publisher';
import { MOCK_FEEDBACK, MOCK_FEEDBACK_NO_TEXT } from '../mocks/feedback.mock';
import { FeedbackHttpClient } from './feedback-api-http-client';

/**
 * The main idea here is to test the FeedbackController class.
 * We will mock the FeedbackPublisher.publish method.
 * We will try to follow 2 narratives:
 *    1. unauthorized user tries to access the feedback endpoints.
 *    2. authorized user tries to access the feedback endpoints and submit feedback.
 */
describe('Feedback API', () => {
	let client: FeedbackHttpClient;

	beforeEach(async () => {
		client = await new FeedbackHttpClient().init({ userId: 10267117, merchantId: 2288 });
		sinon.stub(FeedbackPublisher, 'publish').resolves();
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('UNAUTHORIZED', () => {
		it('POST /feedback should return 401 Unauthorized', async () => {
			const res = await client.removeAuth().saveFeedback(MOCK_FEEDBACK);

			expect(res.status).equals(401);
		});
	});

	describe('AUTHORIZED', () => {
		it('POST /feedback should save feedback with text and return success', async () => {
			const res = await client.saveFeedback(MOCK_FEEDBACK);

			expect(res.status).equals(200);
			expect(res.data).to.deep.equal({ success: true });
			expect(FeedbackPublisher.publish).to.have.been.calledWith({
				...MOCK_FEEDBACK,
				merchant_id: 2288,
				user_id: 10267117,
				created_at: sinon.match.string
			});
		});

		it('POST /feedback should save feedback without text and return success', async () => {
			const res = await client.saveFeedback(MOCK_FEEDBACK_NO_TEXT);

			expect(res.status).equals(200);
			expect(res.data).to.deep.equal({ success: true });
			expect(FeedbackPublisher.publish).to.have.been.calledWith({
				...MOCK_FEEDBACK_NO_TEXT,
				merchant_id: 2288,
				user_id: 10267117,
				created_at: sinon.match.string
			});
		});

		it('POST /feedback should handle publisher errors gracefully', async () => {
			sinon.restore();
			sinon.stub(FeedbackPublisher, 'publish').rejects(new Error('Publisher error'));

			const res = await client.saveFeedback(MOCK_FEEDBACK);

			expect(res.status).equals(200);
			expect(res.data).to.deep.equal({ success: true });
		});
	});
});
