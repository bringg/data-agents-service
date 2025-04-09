import { GetItemIdInput } from '../schemas/get_item_id_schema';

const getDateRange = () => {
	const endDate = new Date();
	const startDate = new Date();

	startDate.setDate(endDate.getDate() - 179);

	return [startDate.toISOString().split('T')[0] + ' 00:00:00', endDate.toISOString().split('T')[0] + ' 23:59:59'];
};

export const PREDEFINED_QUERIES: Record<GetItemIdInput['type'], any> = {
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
			],
			filters: []
		}
	},
	tags: {
		query: {
			dimensions: ['Tasks.tag', 'Tasks.tagId'],
			timeDimensions: [
				{
					dimension: 'Tasks.createdAt',
					dateRange: getDateRange()
				}
			],
			filters: []
		}
	},
	servicePlans: {
		query: {
			dimensions: ['Tasks.servicePlanName', 'Tasks.servicePlanId'],
			timeDimensions: [
				{
					dimension: 'Tasks.createdAt',
					dateRange: getDateRange()
				}
			],
			filters: []
		}
	}
};
