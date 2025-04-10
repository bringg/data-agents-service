import { GetItemIdInput } from '../schemas/get_item_id_schema';

const getDateRange = () => {
	const endDate = new Date();
	const startDate = new Date();

	startDate.setDate(endDate.getDate() - 179);

	return [startDate.toISOString().split('T')[0] + ' 00:00:00', endDate.toISOString().split('T')[0] + ' 23:59:59'];
};

type LoadQueryType = Pick<GetItemIdInput, 'type'> & { type: 'drivers' | 'teams' };

export const PREDEFINED_QUERIES: Record<LoadQueryType['type'], any> = {
	drivers: {
		query: {
			dimensions: ['UsersModel.id', 'UsersModel.name'],
			filters: [
				{
					member: 'UsersModel.driver',
					operator: 'equals',
					values: ['true']
				},
				{
					operator: 'equals',
					values: ['False'],
					member: 'UsersModel.isDeleted'
				}
			]
		}
	},
	teams: {
		query: {
			dimensions: ['Teams.name', 'Teams.id'],
			timeDimensions: [
				{
					dimension: 'Tasks.createdAt',
					dateRange: getDateRange()
				}
			]
		}
	}
};
