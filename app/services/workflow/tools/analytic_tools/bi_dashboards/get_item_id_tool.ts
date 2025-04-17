import { logger } from '@bringg/service';
import { UserContext } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { executeLoadQueryRpc } from '../reports/utils';
import { executeLoadQueryHttp } from '../reports/utils/http_utils';
import { PREDEFINED_QUERIES } from './constants/get_item_id_queries.constants';
import { GetItemIdInput, getItemIdInputSchema } from './schemas/get_item_id_schema';
import { getServiceDataItems } from './utils/service_data_queries';

const toolSchema = {
	name: 'get_item_id',
	description:
		'Get the ID of an item (such as a team, driver, tag, service plan) by its name. If no name provided returns all items.',
	schema: getItemIdInputSchema,
	verboseParsingErrors: true
};

const typeHandlers: Record<
	GetItemIdInput['type'],
	(input: GetItemIdInput, userContext: UserContext) => Promise<unknown>
> = {
	drivers: async (input, userContext) => {
		const { query } = PREDEFINED_QUERIES.drivers;

		if (input.name) {
			query.filters = [
				...(query.filters || []),
				{
					member: 'UsersModel.name',
					operator: 'contains',
					values: [input.name]
				}
			];
		}

		return IS_DEV ? executeLoadQueryHttp(query) : executeLoadQueryRpc(query, userContext);
	},
	teams: async (input, userContext) => {
		const { query } = PREDEFINED_QUERIES.teams;

		if (input.name) {
			query.filters = [
				...(query.filters || []),
				{
					member: 'Teams.name',
					operator: 'contains',
					values: [input.name]
				}
			];
		}

		return IS_DEV ? executeLoadQueryHttp(query) : executeLoadQueryRpc(query, userContext);
	},
	fleets: async (input, userContext) => {
		const items = await getServiceDataItems('fleets', userContext.merchantId);

		return input.name
			? items.filter(item => item.name.toLowerCase().includes(input.name?.toLowerCase() || ''))
			: items;
	},
	servicePlans: async (input, userContext) => {
		const items = await getServiceDataItems('servicePlans', userContext.merchantId);

		return input.name
			? items.filter(item => item.name.toLowerCase().includes(input.name?.toLowerCase() || ''))
			: items;
	},
	tags: async (input, userContext) => {
		const items = await getServiceDataItems('tags', userContext.merchantId);

		return input.name
			? items.filter(item => item.name.toLowerCase().includes(input.name?.toLowerCase() || ''))
			: items;
	}
};

export const getItemIdTool = tool(async (input: GetItemIdInput, { configurable }: RunnableConfig) => {
	const handler = typeHandlers[input.type];

	const { userId, merchantId } = configurable as {
		userId: number;
		merchantId: number;
	};

	try {
		return await handler(input, { userId, merchantId });
	} catch (error) {
		logger.error(`Error getting item id, Error: ${JSON.stringify(error)}`);

		throw new Error(error);
	}
}, toolSchema);
