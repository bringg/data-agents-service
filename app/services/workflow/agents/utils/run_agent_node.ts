/**
 * Executes an agent node with the provided parameters and returns the result.
 *
 * @param params - The parameters for running the agent node.
 * @param params.state - The current state containing messages.
 * @param params.agent - The agent to be invoked, which implements the Runnable interface.
 * @param params.name - The name to be assigned to the last message.
 * @returns An object containing the updated messages with the last message's content and the provided name.
 */
import { HumanMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';

export const runAgentNode = async (params: { state: any; agent: Runnable; name: string }) => {
	const { state, agent, name } = params;
	const result = await agent.invoke({
		messages: state.messages
	});
	const lastMessage = result.messages[result.messages.length - 1];
	return {
		messages: [new HumanMessage({ content: lastMessage.content, name })]
	};
};
