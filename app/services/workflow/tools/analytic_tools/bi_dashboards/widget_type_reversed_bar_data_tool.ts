import { AnalyticsWidgetDataDto, WidgetType } from '@bringg/types';
import { RunnableConfig } from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';

import { IS_DEV } from '../../../../../common/constants';
import { widgetTypeReversedBarDataInputSchema } from './schemas/widgets_schemas';
import { executeWidgetTypeDataHttp } from './utils/http_utils';
import { executeWidgetTypeReversedBarDataRpc } from './utils/rpc_utils';

const toolSchema = {
	name: 'widget_type_reversed_bar_data_tool',
	description:
		'Fetches analytics data for a specific widget catalog item (presented as a reversed bar chart) using filters, grouping, and time granularity as needed.',
	schema: widgetTypeReversedBarDataInputSchema,
	verboseParsingErrors: true
};

const processReversedBarData = (data: AnalyticsWidgetDataDto, limit?: number, order?: 'asc' | 'desc') => {
	if (order === 'desc') {
		data.series[0].data.sort((a, b) => b.y - a.y);
	} else if (order === 'asc') {
		data.series[0].data.sort((a, b) => a.y - b.y);
	}

	if (limit && data.number) {
		data.series[0].data = data.series[0].data.slice(0, limit);
		data.number.value = data.series[0].data.reduce((sum, item) => sum + item.y, 0);
	}

	return data;
};

export const _widgetTypeReversedBarDataToolHttp = tool(async input => {
	const parsedInput = widgetTypeReversedBarDataInputSchema.parse(input);
	const { limit, order, ...restInput } = parsedInput;

	const response = (await executeWidgetTypeDataHttp(restInput, WidgetType.ReversedBarChart)) as {
		data: AnalyticsWidgetDataDto;
	};

	return processReversedBarData(response.data, limit, order);
}, toolSchema);

export const _widgetTypeReversedBarDataToolRpc = tool(async (input, { configurable }: RunnableConfig) => {
	const { userId, merchantId } = configurable as { userId: number; merchantId: number };
	const parsedInput = widgetTypeReversedBarDataInputSchema.parse(input);

	const response = await executeWidgetTypeReversedBarDataRpc({
		...parsedInput,
		userContext: { userId, merchantId }
	});

	return processReversedBarData(response, parsedInput.limit, parsedInput.order);
}, toolSchema);

export const widgetTypeReversedBarDataTool = !IS_DEV
	? _widgetTypeReversedBarDataToolRpc
	: _widgetTypeReversedBarDataToolHttp;
