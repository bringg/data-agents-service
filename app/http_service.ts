import HttpServiceBuilder from '@bringg/service/lib/http_service_builder';
import cors from 'cors';

import { IS_DEV } from './common/constants';
import { PROJECT_ROOT_PATH } from './project-root-path';

export const httpService = new HttpServiceBuilder()
	.useContext()
	.useRoot(PROJECT_ROOT_PATH)
	.useServicePattern(...[`./**/*controller.{ts,js}`])
	.useHandlers([IS_DEV ? cors() : () => {}])
	.build();
