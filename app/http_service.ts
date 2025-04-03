import HttpServiceBuilder from '@bringg/service/lib/http_service_builder';
import cors from 'cors';

import { PROJECT_ROOT_PATH } from './project-root-path';
import { IS_DEV } from './common/constants';

export const httpService = new HttpServiceBuilder()
	.useContext()
	.useRoot(PROJECT_ROOT_PATH)
	.useServicePattern(...[`./**/*controller.{ts,js}`])
	.useHandlers([IS_DEV ? cors() : () => {}])
	.build();
