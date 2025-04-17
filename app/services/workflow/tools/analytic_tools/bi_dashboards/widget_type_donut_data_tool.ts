//! NO HTTP ENDPOINT
import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeDonutDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeDonutDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_donut_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a donut chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeDonutDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeDonutDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.DonutChart);
}, toolSchema);

export const _widgetTypeDonutDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeDonutDataInputSchema.parse(input);

	return executeWidgetTypeDonutDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeDonutDataTool = !IS_DEV ? _widgetTypeDonutDataToolRpc : _widgetTypeDonutDataToolHttp;
