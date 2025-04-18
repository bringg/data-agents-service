import { IS_DEV } from '../../../../../../common/constants';
import { getItemIdTool } from '../get_item_id_tool';
import { widgetTypeBarDataTool } from '../widget_type_bar_data_tool';
import { widgetTypeBasicLineDataTool } from '../widget_type_basic_line_data_tool';
import { widgetTypeDonutDataTool } from '../widget_type_donut_data_tool';
import { widgetTypeDoubleYAxisDataTool } from '../widget_type_double_y_axis_data_tool';
import { widgetTypeLineDataTool } from '../widget_type_line_data_tool';
import { widgetTypeMultiHorizontalReversedBarDataTool } from '../widget_type_multi_horizontal_reversed_bar_data_tool';
import { widgetTypeNumberDataTool } from '../widget_type_number_data_tool';
import { widgetTypePieDataTool } from '../widget_type_pie_data_tool';
import { widgetTypeReversedBarDataTool } from '../widget_type_reversed_bar_data_tool';
import { widgetTypeReversedFullWidthBarDataTool } from '../widget_type_reversed_full_width_bar_data_tool';

export const WIDGET_DATA_TOOLS = [
	widgetTypeBarDataTool,
	widgetTypeDoubleYAxisDataTool,
	widgetTypeMultiHorizontalReversedBarDataTool,
	widgetTypeNumberDataTool,
	widgetTypeReversedBarDataTool,
	getItemIdTool,
	// In dev we can't use these tools because they are not implemented via HTTP
	...(!IS_DEV
		? [
				widgetTypeBasicLineDataTool,
				widgetTypeDonutDataTool,
				widgetTypeLineDataTool,
				widgetTypePieDataTool,
				widgetTypeReversedFullWidthBarDataTool
		  ]
		: [])
];
