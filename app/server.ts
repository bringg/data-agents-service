import { logger } from '@bringg/service';
import * as serviceInfo from '@bringg/service/lib/serviceinfo';

import { httpService } from './http_service';
// import { AgentsRpcService } from './core/rpc_service';

async function main(): Promise<void> {
	// new AgentsRpcService().initialize();
	httpService.start();
}

main()
	.then(() => {
		logger.info(`${serviceInfo.name} start succeed`);
	})
	.catch(err => {
		logger.error(`${serviceInfo.name} start failed`, { error: err });
	});
