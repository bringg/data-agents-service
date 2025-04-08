import { analyticsRpcClient } from '@bringg/service-utils';
import { DashboardType, UserContext, WidgetCatalogItemDto } from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';

import { IS_DEV } from '../../../../../common/constants';
import { getAnalyticsJWT } from '../../../../../common/utils/jwt.utils';
import { getTranslationsDict } from './get_translations_dict.utils';

export const _widgetCatalogMetaHttp = async (): Promise<{ widgets: Partial<WidgetCatalogItemDto>[] }> => {
	const url = `https://${process.env.REGION}-admin-api.bringg.com/analytics-service/v1/dashboards/widgets-catalog-items`;
	const jwt = getAnalyticsJWT();

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
	userContext: UserContext
): Promise<{ widgets: Partial<WidgetCatalogItemDto>[] }> => {
	const widgetCatalogItems: WidgetCatalogItemDto[] = await analyticsRpcClient.ownFleet.widgetCatalogItems.list({
		payload: {
			userContext,
			dashboardType: DashboardType.Standard
		},
		options: {
			requestId: uuidv4()
		}
	});

	const formattedMeta = _widgetCatalogMetaFormat(widgetCatalogItems);

	return formattedMeta;
};

// Format the meta to be used in the widget catalog builder agent
const _widgetCatalogMetaFormat = async (
	widgets: WidgetCatalogItemDto[]
): Promise<{ widgets: Partial<WidgetCatalogItemDto>[] }> => {
	const translationsDict = await getTranslationsDict();

	const formattedWidgets = widgets.map(
		({
			defaultTitle,
			id,
			availableWidgetTypes,
			availableGroupBy,
			availableStackedBy,
			defaultDescription,
			availableFilters,
			queriesJsons,
			defaultWidgetType
		}) => ({
			id,
			title: translationsDict[defaultTitle],
			description: translationsDict[defaultDescription],
			availableWidgetTypes,
			availableGroupBy,
			availableStackedBy,
			availableFilters,
			queriesJsons,
			defaultWidgetType
		})
	);

	return { widgets: formattedWidgets };
};

export const widgetCatalogMeta = async (userContext: UserContext): Promise<string> => {
	const meta = !IS_DEV ? await _widgetCatalogMetaRpc(userContext) : await _widgetCatalogMetaHttp();

	return JSON.stringify(meta);
};
