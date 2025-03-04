import { BaseHttpClient } from '@bringg/test-utils';

import { runServer } from '../__helper__/run-server';

BaseHttpClient.setRunServer(async () => ({
	servers: await runServer()
}));
