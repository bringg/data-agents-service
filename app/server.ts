import { config, logger } from '@bringg/service';
import * as serviceInfo from '@bringg/service/lib/serviceinfo';

import { httpService } from './http_service';
import { SuperWorkflow } from './services/workflow/graphs/super_graph';

export async function main(): Promise<void> {
	await SuperWorkflow.initialize();

	httpService.start();
}

main()
	.then(() => {
		logger.info(`${serviceInfo.name} start succeed`);
	})
	.catch(err => {
		logger.error(`${serviceInfo.name} start failed`, { error: err });
	});
