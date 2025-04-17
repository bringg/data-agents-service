import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeBasicLineDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeBasicLineDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_basic_line_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a basic line chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeBasicLineDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeBasicLineDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp({ input }, WidgetType.BasicLineChart);
}, toolSchema);

export const _widgetTypeBasicLineDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeBasicLineDataInputSchema.parse(input);

	return executeWidgetTypeBasicLineDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeBasicLineDataTool = !IS_DEV ? _widgetTypeBasicLineDataToolRpc : _widgetTypeBasicLineDataToolHttp;
