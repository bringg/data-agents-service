import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeMultiHorizontalReversedBarDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeMultiHorizontalReversedBarDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_multi_horizontal_reversed_bar_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a multi horizontal reversed bar chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeMultiHorizontalReversedBarDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeMultiHorizontalReversedBarDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.MultiHorizontalReversedBarChart);
}, toolSchema);

export const _widgetTypeMultiHorizontalReversedBarDataToolRpc = tool(
	async (input, { configurable }: RunnableConfig) => {
		const { userId, merchantId } = configurable as { userId: number; merchantId: number };
		const parsedInput = widgetTypeMultiHorizontalReversedBarDataInputSchema.parse(input);

		return executeWidgetTypeMultiHorizontalReversedBarDataRpc({
			...parsedInput,
			userContext: { userId, merchantId }
		});
	},
	toolSchema
);

export const widgetTypeMultiHorizontalReversedBarDataTool = !IS_DEV
	? _widgetTypeMultiHorizontalReversedBarDataToolRpc
	: _widgetTypeMultiHorizontalReversedBarDataToolHttp;
