import { Servers } from '@bringg/test-utils';
import { Server } from 'http';

import { httpService } from '../../app/http_service';

let httpServerApp: Server | undefined;

export async function runServer(): Promise<Servers> {
	if (httpServerApp) {
		return httpServerApp!;
	}
	httpServerApp = httpService.start();

	if (httpServerApp) {
		httpServerApp.once('close', () => {
			httpServerApp = undefined;
		});
		httpServerApp.once('error', () => {
			httpServerApp = undefined;
		});
	}

	return httpServerApp!;
}
