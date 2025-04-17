import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypePieDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypePieDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_pie_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a pie chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypePieDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypePieDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.PieChart);
}, toolSchema);

export const _widgetTypePieDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypePieDataInputSchema.parse(input);

	return executeWidgetTypePieDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypePieDataTool = !IS_DEV ? _widgetTypePieDataToolRpc : _widgetTypePieDataToolHttp;
