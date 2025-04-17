import {
	GetOwnFleetBarChartDataRpcRequestPayload,
	GetOwnFleetBasicLineChartDataRpcRequestPayload,
	GetOwnFleetDonutChartDataRpcRequestPayload,
	GetOwnFleetDoubleYAxisChartDataRpcRequestPayload,
	GetOwnFleetLineChartDataRpcRequestPayload,
	GetOwnFleetMultiHorizontalReversedBarChartDataRpcRequestPayload,
	GetOwnFleetNumberChartDataRpcRequestPayload,
	GetOwnFleetPieChartDataRpcRequestPayload,
	GetOwnFleetReversedBarChartDataRpcRequestPayload,
	GetOwnFleetReversedFullWidthBarChartDataRpcRequestPayload,
	WidgetDataFilterBase
} from '@bringg/types';
import { z } from 'zod';

// @ts-ignore
const filterSchema: z.ZodType<WidgetDataFilterBase> = z.object({
	comparison: z.array(z.string()).length(2).optional(),
	dates: z.array(z.string()).length(2),
	teams: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message:
					'Team must be a numeric string that equals to the team ID. Use get_item_id_tool to get the team ID.'
			})
		)
		.optional(),
	parents: z.array(z.string()).optional(),
	drivers: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message:
					'Driver must be a numeric string that equals to the driver ID. Use get_item_id_tool to get the driver ID.'
			})
		)
		.optional(),
	fleets: z.array(z.string()).optional(),
	tags: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message:
					'Tag must be a numeric string that equals to the tag ID. Use get_item_id_tool to get the tag ID.'
			})
		)
		.optional(),
	taskTypes: z.array(z.enum(['PICK_UP', 'RETURNS', 'DROP_OFF', 'PICK_UP_AND_DROP_OFF'])).optional(),
	servicePlans: z
		.array(
			z.string().refine(value => /^\d+$/.test(value), {
				message:
					'ServicePlan must be a numeric string that equals to the ServicePlan ID. Use get_item_id_tool to get the ServicePlan ID.'
			})
		)
		.optional(),
	merchants: z.array(z.string()).optional()
});

export const widgetTypeBasicLineDataInputSchema = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	useTimeDimension: z.boolean(),
	groupBy: z.number().int().min(0).max(10).optional(),
	granularity: z.number().int().min(0).max(3).optional(),
	hasTrend: z.boolean(),
	trendDirection: z.number().int().min(0).max(1).optional()
}) as z.ZodType<Omit<GetOwnFleetBasicLineChartDataRpcRequestPayload, 'userContext'>>;

export const widgetTypeBarDataInputSchema: z.ZodType<Omit<GetOwnFleetBarChartDataRpcRequestPayload, 'userContext'>> =
	z.object({
		widgetCatalogId: z.number(),
		filter: filterSchema,
		timezone: z.string(),
		useTimeDimension: z.boolean(),
		groupBy: z.number().int().min(0).max(10).optional(),
		stackedBy: z.number().int().min(0).max(10).optional(),
		granularity: z.number().int().min(0).max(3).optional()
	});

export const widgetTypePieDataInputSchema = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	hasTrend: z.boolean(),
	trendDirection: z.number().int().min(0).max(1).optional(),
	groupBy: z.number().int().min(0).max(10).optional()
}) as z.ZodType<Omit<GetOwnFleetPieChartDataRpcRequestPayload, 'userContext'>>;

export const widgetTypeDonutDataInputSchema = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	hasTrend: z.boolean(),
	trendDirection: z.number().int().min(0).max(1).optional(),
	groupBy: z.number().int().min(0).max(10).optional()
}) as z.ZodType<Omit<GetOwnFleetDonutChartDataRpcRequestPayload, 'userContext'>>;

export const widgetTypeReversedBarDataInputSchema: z.ZodType<
	Omit<GetOwnFleetReversedBarChartDataRpcRequestPayload, 'userContext' | 'widgetType'> & {
		limit?: number;
		order?: 'asc' | 'desc';
	}
> = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	groupBy: z.number().int().min(0).max(10).optional(),
	stackedBy: z.number().int().min(0).max(10).optional(),
	limit: z.number().int().min(0).max(1000).optional(),
	order: z.enum(['asc', 'desc']).optional()
});

export const widgetTypeReversedFullWidthBarDataInputSchema: z.ZodType<
	Omit<GetOwnFleetReversedFullWidthBarChartDataRpcRequestPayload, 'userContext' | 'widgetType'>
> = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	groupBy: z.number().int().min(0).max(10).optional(),
	stackedBy: z.number().int().min(0).max(10).optional()
});

export const widgetTypeMultiHorizontalReversedBarDataInputSchema: z.ZodType<
	Omit<GetOwnFleetMultiHorizontalReversedBarChartDataRpcRequestPayload, 'userContext'>
> = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	groupBy: z.number().int().min(0).max(10).optional(),
	stackedBy: z.number().int().min(0).max(10).optional()
});

export const widgetTypeDoubleYAxisDataInputSchema: z.ZodType<
	Omit<GetOwnFleetDoubleYAxisChartDataRpcRequestPayload, 'userContext'>
> = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	groupBy: z.number().int().min(0).max(10).optional(),
	stackedBy: z.number().int().min(0).max(10).optional()
});

export const widgetTypeNumberDataInputSchema: z.ZodType<
	Omit<GetOwnFleetNumberChartDataRpcRequestPayload, 'userContext'>
> = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string()
});

export const widgetTypeLineDataInputSchema = z.object({
	widgetCatalogId: z.number(),
	filter: filterSchema,
	timezone: z.string(),
	useTimeDimension: z.boolean(),
	groupBy: z.number().int().min(0).max(10).optional(),
	granularity: z.number().int().min(0).max(3).optional(),
	hasTrend: z.boolean(),
	trendDirection: z.number().int().min(0).max(1).optional()
}) as z.ZodType<Omit<GetOwnFleetLineChartDataRpcRequestPayload, 'userContext'>>;
