import { DashboardType, WidgetCatalogItemDto } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { SuperWorkflow } from '../../../graphs/super_graph';
import { getDescriptionsDict } from './utils';

const toolSchema = {
	name: 'widget_catalog_meta_tool',
	description: 'Returns a list of widget catalog items for the “Own Fleet” dashboard (dashboardType=0).'
};

export const _widgetCatalogMetaToolHttp = tool(async () => {
	const url = 'https://us2-admin-api.bringg.com/analytics-service/v1/dashboards/widgets-catalog-items';
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
	const descriptionsDict = await getDescriptionsDict();

	const populatedDescriptionData = data.map(item => ({
		...item,
		defaultDescription: descriptionsDict[item.defaultDescription]
	}));

	return { data: populatedDescriptionData };
}, toolSchema);

export const _widgetCatalogMetaToolRpc = tool(async (_, config: RunnableConfig) => {
	const { merchant_id, user_id } = config.configurable as { merchant_id: number; user_id: number };

	const widgetCatalogItems: WidgetCatalogItemDto[] = await SuperWorkflow.rpcClient.getOwnFleetWidgetCatalogItems({
		payload: {
			userContext: { userId: user_id, merchantId: merchant_id },
			dashboardType: DashboardType.Standard
		}
	});

	const descriptionsDict = await getDescriptionsDict();

	const populatedDescriptionData = widgetCatalogItems.map(item => ({
		...item,
		defaultDescription: descriptionsDict[item.defaultDescription]
	}));

	return { data: populatedDescriptionData };
}, toolSchema);

export const widgetCatalogMetaTool = !IS_DEV ? _widgetCatalogMetaToolRpc : _widgetCatalogMetaToolHttp;
