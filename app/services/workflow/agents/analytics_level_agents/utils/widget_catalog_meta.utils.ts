import { DashboardType, WidgetCatalogItemDto } from '@bringg/types';

import { IS_DEV } from '../../../../../common/constants';
import { SuperWorkflow } from '../../../graphs/super_graph';
import { getDescriptionsDict } from './get_descriptions_dict.utils';

export const _widgetCatalogMetaHttp = async (): Promise<{ widgets: Partial<WidgetCatalogItemDto>[] }> => {
	const url = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/dashboards/widgets-catalog-items`;
	const jwt = process.env.analyticsJWT;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const { data } = (await response.json()) as { data: Array<WidgetCatalogItemDto> };

	const formattedMeta = _widgetCatalogMetaFormat(data);

	return formattedMeta;
};

export const _widgetCatalogMetaRpc = async (
	merchantId: number,
	userId: number
): Promise<{ widgets: Partial<WidgetCatalogItemDto>[] }> => {
	const widgetCatalogItems: WidgetCatalogItemDto[] = await SuperWorkflow.rpcClient.getOwnFleetWidgetCatalogItems({
		payload: {
			userContext: { userId, merchantId },
			dashboardType: DashboardType.Standard
		}
	});

	const formattedMeta = _widgetCatalogMetaFormat(widgetCatalogItems);

	return formattedMeta;
};

// Format the meta to be used in the widget catalog builder agent
const _widgetCatalogMetaFormat = async (
	widgets: WidgetCatalogItemDto[]
): Promise<{ widgets: Partial<WidgetCatalogItemDto>[] }> => {
	const descriptionsDict = await getDescriptionsDict();

	const formattedWidgets = widgets.map(
		({ defaultTitle, id, availableWidgetTypes, availableGroupBy, availableStackedBy, defaultDescription }) => ({
			id,
			defaultTitle,
			availableWidgetTypes,
			availableGroupBy,
			defaultDescription: descriptionsDict[defaultDescription],
			availableStackedBy
		})
	);

	return { widgets: formattedWidgets };
};

export const widgetCatalogMeta = async (merchantId: number, userId: number): Promise<string> => {
	const meta = !IS_DEV ? await _widgetCatalogMetaRpc(merchantId, userId) : await _widgetCatalogMetaHttp();

	return JSON.stringify(meta);
};
