import { tool } from '@langchain/core/tools';

import { executeLoadQueryHttp } from '../reports/utils/http_utils';
import { PREDEFINED_QUERIES } from './constants/get_item_id_queries.constants';
import { GetItemIdInput, getItemIdInputSchema } from './schemas/get_item_id_schema';

const toolSchema = {
	name: 'get_item_id',
	description:
		'Get the ID of an item (such as a team, driver, tag, service plan) by its name. If no name provided returns all items.',
	schema: getItemIdInputSchema,
	verboseParsingErrors: true
};

export const getItemIdTool = tool(async (input: GetItemIdInput) => {
	const query = PREDEFINED_QUERIES[input.type];

	if (input.name) {
		query.query.filters = [
			...(query.query.filters || []),
			{
				member:
					input.type === 'drivers'
						? 'UsersModel.name'
						: input.type === 'teams'
						? 'Teams.name'
						: input.type === 'tags'
						? 'Tasks.tag'
						: 'Tasks.servicePlanName',
				operator: 'contains',
				values: [input.name]
			}
		];
	}

	const result = await executeLoadQueryHttp(query);

	return result;
}, toolSchema);
