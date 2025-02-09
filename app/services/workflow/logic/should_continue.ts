import { AIMessage } from '@langchain/core/messages';
import { GraphState } from '../graph/graph';
import { END } from '@langchain/langgraph';

export const shouldContinue = async (state: typeof GraphState.State) => {
	const messages = state.messages;
	const lastMessage = messages[messages.length - 1] as AIMessage;

	// If the LLM makes a tool call, then we route to the "tools" node
	if (lastMessage.tool_calls?.length) {
		return 'tools';
	}

	// Otherwise, we stop (reply to the user)
	return END;
};
