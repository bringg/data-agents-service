import { WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeNumberDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeNumberDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_number_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a number chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeNumberDataInputSchema,
	verboseParsingErrors: true
};

export const _widgetTypeNumberDataToolHttp = tool(async input => {
	return executeWidgetTypeDataHttp(input, WidgetType.Number);
}, toolSchema);

export const _widgetTypeNumberDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };

	const parsedInput = widgetTypeNumberDataInputSchema.parse(input);

	return executeWidgetTypeNumberDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});
}, toolSchema);

export const widgetTypeNumberDataTool = !IS_DEV ? _widgetTypeNumberDataToolRpc : _widgetTypeNumberDataToolHttp;
