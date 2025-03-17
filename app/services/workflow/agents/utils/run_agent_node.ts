import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';

/**
 * Executes an agent node with the provided parameters and returns the result.
 *
 * @param params - The parameters for running the agent node.
 * @param params.state - The current state containing messages.
 * @param params.agent - The agent to be invoked, which implements the Runnable interface.
 * @param params.name - The name to be assigned to the last message.
 * @param params.hasHistory - Whether the state contains history messages.
 * @param params.hasToolHistory - Whether the state contains tool history messages.
 * @returns An object containing the updated messages with the last message's content and the provided name.
 */
export const runAgentNode = async (params: {
	state: { messages: BaseMessage[]; instructions: string; tool_messages?: BaseMessage[] };
	agent: Runnable;
	name: string;
	supervisorName: string;
	hasHistory?: boolean;
	hasToolHistory?: boolean;
}): Promise<{ messages: HumanMessage[]; tool_messages?: BaseMessage[] }> => {
	const { state, agent, name } = params;

	const result: { messages: BaseMessage[] } = await agent.invoke({
		messages: [
			...(params.hasHistory ? state.messages : []),
			...(params.hasToolHistory && state.tool_messages ? state.tool_messages : []),
			new HumanMessage({ content: state.instructions, name: params.supervisorName })
		]
	});

	// The last three messages are the most relevant => tool_call, tool_res, ai_res
	const lastMessages = result.messages.slice(-3);

	const lastMessage = new HumanMessage({ content: lastMessages[lastMessages.length - 1].content, name });

	const toolMessages = lastMessages.length === 3 ? lastMessages.slice(0, 2) : [];

	return {
		messages: [lastMessage],
		...(state.tool_messages && { tool_messages: toolMessages })
	};
};
