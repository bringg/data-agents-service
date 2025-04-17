import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeBarDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeBarDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_bar_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a bar chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeBarDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeBarDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.BarChart);
}, toolSchema);

export const _widgetTypeBarDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeBarDataInputSchema.parse(input);

	return executeWidgetTypeBarDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeBarDataTool = !IS_DEV ? _widgetTypeBarDataToolRpc : _widgetTypeBarDataToolHttp;
