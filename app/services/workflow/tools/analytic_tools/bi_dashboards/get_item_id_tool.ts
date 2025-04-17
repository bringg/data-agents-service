import { tool } from '@langchain/core/tools';

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

const typeHandlers: Record<GetItemIdInput['type'], (input: GetItemIdInput) => Promise<unknown>> = {
	drivers: async input => {
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

		return executeLoadQueryHttp(query);
	},
	teams: async input => {
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

		return executeLoadQueryHttp(query);
	},
	fleets: async input => {
		const items = await getServiceDataItems('fleets', process.env.MERCHANT_ID as unknown as number);

		return input.name
			? items.filter(item => item.name.toLowerCase().includes(input.name?.toLowerCase() || ''))
			: items;
	},
	servicePlans: async input => {
		const items = await getServiceDataItems('servicePlans', process.env.MERCHANT_ID as unknown as number);

		return input.name
			? items.filter(item => item.name.toLowerCase().includes(input.name?.toLowerCase() || ''))
			: items;
	},
	tags: async input => {
		const items = await getServiceDataItems('tags', process.env.MERCHANT_ID as unknown as number);

		return input.name
			? items.filter(item => item.name.toLowerCase().includes(input.name?.toLowerCase() || ''))
			: items;
	}
};

export const getItemIdTool = tool(async (input: GetItemIdInput) => {
	const handler = typeHandlers[input.type];

	return await handler(input);
}, toolSchema);
