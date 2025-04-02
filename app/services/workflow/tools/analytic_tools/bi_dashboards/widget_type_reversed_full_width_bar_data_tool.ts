import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeReversedFullWidthBarDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeReversedFullWidthBarDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_reversed_full_width_bar_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a reversed full width bar chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeReversedFullWidthBarDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeReversedFullWidthBarDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.ReversedFullWidthBarChart);
}, toolSchema);

export const _widgetTypeReversedFullWidthBarDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeReversedFullWidthBarDataInputSchema.parse(input);

	return executeWidgetTypeReversedFullWidthBarDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeReversedFullWidthBarDataTool = !IS_DEV
	? _widgetTypeReversedFullWidthBarDataToolRpc
	: _widgetTypeReversedFullWidthBarDataToolHttp;
