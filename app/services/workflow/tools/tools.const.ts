import { GraphState } from '../graph/graph';
import { analyticsServiceTool } from './analyticsServiceTool';
import { reportsBuilderTool } from './reportsBuilderTool';
import { ToolNode } from '@langchain/langgraph/prebuilt';

export const TOOLS = [analyticsServiceTool, reportsBuilderTool];
export const TOOL_NAMES = [analyticsServiceTool.name, reportsBuilderTool.name];

export const toolNodes = new ToolNode<typeof GraphState.State>(TOOLS);
