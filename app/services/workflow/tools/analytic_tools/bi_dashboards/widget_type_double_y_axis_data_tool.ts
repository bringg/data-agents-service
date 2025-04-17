import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeDoubleYAxisDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeDoubleYAxisDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_double_y_axis_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a double Y axis chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeDoubleYAxisDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeDoubleYAxisDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.DoubleYAxisChart);
}, toolSchema);

export const _widgetTypeDoubleYAxisDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeDoubleYAxisDataInputSchema.parse(input);

	return executeWidgetTypeDoubleYAxisDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeDoubleYAxisDataTool = !IS_DEV
	? _widgetTypeDoubleYAxisDataToolRpc
	: _widgetTypeDoubleYAxisDataToolHttp;
