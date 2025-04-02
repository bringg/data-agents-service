import { analyticsRpcClient } from '@bringg/service-utils';
import {
	OwnFleetBarChartDataDto,
	OwnFleetBasicLineChartDataDto,
	OwnFleetDonutChartDataDto,
	OwnFleetDoubleYAxisChartDataDto,
	OwnFleetLineChartDataDto,
	OwnFleetMultiHorizontalReversedBarChartDataDto,
	OwnFleetNumberChartDataDto,
	OwnFleetPieChartDataDto,
	OwnFleetReversedBarChartDataDto,
	OwnFleetReversedFullWidthBarChartDataDto,
	UserContext,
	WidgetType
} from '@bringg/types';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import {
	widgetTypeBarDataInputSchema,
	widgetTypeBasicLineDataInputSchema,
	widgetTypeDonutDataInputSchema,
	widgetTypeDoubleYAxisDataInputSchema,
	widgetTypeLineDataInputSchema,
	widgetTypeMultiHorizontalReversedBarDataInputSchema,
	widgetTypeNumberDataInputSchema,
	widgetTypePieDataInputSchema,
	widgetTypeReversedBarDataInputSchema,
	widgetTypeReversedFullWidthBarDataInputSchema
} from '../schemas/widgets_schemas';

const buildRpcOptions = () => ({
	options: {
		requestId: uuidv4()
	}
});

export const executeWidgetTypePieDataRpc = async (
	input: z.infer<typeof widgetTypePieDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetPieChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getPieChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeLineDataRpc = async (
	input: z.infer<typeof widgetTypeLineDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetLineChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getLineChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeDonutDataRpc = async (
	input: z.infer<typeof widgetTypeDonutDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetDonutChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getDonutChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeNumberDataRpc = async (
	input: z.infer<typeof widgetTypeNumberDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetNumberChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getNumberChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeBasicLineDataRpc = async (
	input: z.infer<typeof widgetTypeBasicLineDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetBasicLineChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getBasicLineChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeReversedBarDataRpc = async (
	input: z.infer<typeof widgetTypeReversedBarDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetReversedBarChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getReversedBarChartData({
		payload: { ...input, widgetType: WidgetType.ReversedBarChart },
		...buildRpcOptions()
	});
};

export const executeWidgetTypeDoubleYAxisDataRpc = async (
	input: z.infer<typeof widgetTypeDoubleYAxisDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetDoubleYAxisChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getDoubleYAxisChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeReversedFullWidthBarDataRpc = async (
	input: z.infer<typeof widgetTypeReversedFullWidthBarDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetReversedFullWidthBarChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getReversedFullWidthBarChartData({
		payload: { ...input, widgetType: WidgetType.ReversedFullWidthBarChart },
		...buildRpcOptions()
	});
};

export const executeWidgetTypeMultiHorizontalReversedBarDataRpc = async (
	input: z.infer<typeof widgetTypeMultiHorizontalReversedBarDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetMultiHorizontalReversedBarChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getMultiHorizontalReversedBarChartData({
		payload: input,
		...buildRpcOptions()
	});
};

export const executeWidgetTypeBarDataRpc = async (
	input: z.infer<typeof widgetTypeBarDataInputSchema> & { userContext: UserContext }
): Promise<OwnFleetBarChartDataDto> => {
	return await analyticsRpcClient.ownFleet.widgetData.getBarChartData({
		payload: input,
		...buildRpcOptions()
	});
};
