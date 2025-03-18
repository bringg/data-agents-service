import { BaseMessage, SystemMessage } from '@langchain/core/messages';
import { StructuredToolInterface } from '@langchain/core/tools';
import { MessagesAnnotation } from '@langchain/langgraph';

/**
 * Modifies the state of the agent by adding a system message at the beginning of the messages.
 *
 * @param systemPrompt - The prompt to be displayed in the system messages.
 * @param tools - The tools available to the agent.
 * @param teamMembers - The team members of the agent.
 * @returns A function that modifies the state of the agent.
 */
export const agentStateModifier = (
	systemPrompt: string,
	tools: StructuredToolInterface[],
	teamMembers: string[],
	meta?: string
): ((state: typeof MessagesAnnotation.State) => BaseMessage[]) => {
	const toolNames = tools.map(t => t.name).join(', ');

	const systemMsg = new SystemMessage(
		`${systemPrompt}

			Work autonomously according to your specialty, using the tools available to you.
			 Do not ask for clarification.
			 Your other team members (and other teams) will collaborate with you with their own specialties.
			 You are chosen for a reason! You are one of the following team members: ${teamMembers.join(', ')}.
			  Remember, you individually can only use these tools: ${toolNames}.
			  End only if you have already completed the requested task, were given a wrong task or you don't have the
			  necessary knowledge in order to provide the answer. 
			  Communicate the work completed.
			  Current time: ${new Date().toISOString()}
			  
		${
			meta
				? `**Metadata Message:**
				  \`\`\`json
				  ${meta}
				  \`\`\``
				: ''
		}`
	);

	return (state: typeof MessagesAnnotation.State): BaseMessage[] => [systemMsg, ...state.messages];
};
