import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeLineDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeLineDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_line_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a line chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeLineDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeLineDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.LineChart);
}, toolSchema);

export const _widgetTypeLineDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeLineDataInputSchema.parse(input);

	return executeWidgetTypeLineDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeLineDataTool = !IS_DEV ? _widgetTypeLineDataToolRpc : _widgetTypeLineDataToolHttp;
