import { expect } from 'chai';
import * as sinon from 'sinon';

import { httpService } from '../../app/http_service';
import { main } from '../../app/server';
import { SuperWorkflow } from '../../app/services/workflow/graphs/super_graph';

describe('Server', () => {
	beforeEach(() => {
		sinon.stub(httpService, 'start');
		sinon.stub(SuperWorkflow, 'initialize');
	});

	describe('Start App', () => {
		it('should init SuperGraph', async () => {
			await main();
			expect(SuperWorkflow.initialize).to.have.been.called;
		});
	});
});
