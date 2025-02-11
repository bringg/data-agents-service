import { GraphState } from '../graphs/main_graph/main_graph';
import { analyticsServiceTool } from './bi_dashboards_tool';
import { reportsBuilderTool } from './reportsBuilderTool';
import { ToolNode } from '@langchain/langgraph/prebuilt';

export const TOOLS = [analyticsServiceTool, reportsBuilderTool];
export const TOOL_NAMES = [analyticsServiceTool.name, reportsBuilderTool.name];

export const toolNodes = new ToolNode<typeof GraphState.State>(TOOLS);
