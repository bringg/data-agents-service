import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';
import { FormattedMetaResponse } from 'app/services/workflow/types';
import { z } from 'zod';

import { IS_DEV } from '../../../../../common/constants';
import { QueryZodSchema } from './schemas/load_tool_schemas';
import { executeLoadQueryHttp } from './utils/http_utils';
import { executeLoadQueryRpc } from './utils/rpc_utils';
import { validateQueryLogic } from './utils/validation_utils';

const toolSchema = {
	name: 'load_tool',
	description:
		'Executes a query against the metadata. Include dimensions, measures, filters, or date range in the request body.',
	schema: z.object({
		query: QueryZodSchema
	}),
	verboseParsingErrors: true
};

export const _loadToolHttp = tool(async ({ query }, { configurable }: RunnableConfig) => {
	const { meta } = configurable as { meta: FormattedMetaResponse };

	await validateQueryLogic(query, meta);

	return executeLoadQueryHttp(query);
}, toolSchema);

const _loadToolRpc = tool(async ({ query }, { configurable }: RunnableConfig) => {
	const { userId, merchantId, meta } = configurable as {
		userId: number;
		merchantId: number;
		meta: FormattedMetaResponse;
	};

	await validateQueryLogic(query, meta);

	return executeLoadQueryRpc(query, { userId, merchantId });
}, toolSchema);

export const loadTool = !IS_DEV ? _loadToolRpc : _loadToolHttp;
