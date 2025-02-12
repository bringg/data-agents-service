import { BaseMessage, SystemMessage } from '@langchain/core/messages';
import { StructuredToolInterface } from '@langchain/core/tools';
import { MessagesAnnotation } from '@langchain/langgraph';

/**
 * Modifies the state of the agent by adding a system message at the beginning and end of the messages.
 *
 * @param systemPrompt - The prompt to be displayed in the system messages.
 * @param tools - The tools available to the agent.
 * @param teamMembers - The team members of the agent.
 * @returns A function that modifies the state of the agent.
 */
export const agentStateModifier = (
	systemPrompt: string,
	tools: StructuredToolInterface[],
	teamMembers: string[]
): ((state: typeof MessagesAnnotation.State) => BaseMessage[]) => {
	const toolNames = tools.map(t => t.name).join(', ');
	const systemMsgStart = new SystemMessage(
		systemPrompt +
			'\nWork autonomously according to your specialty, using the tools available to you.' +
			' Do not ask for clarification.' +
			' Your other team members (and other teams) will collaborate with you with their own specialties.' +
			` You are chosen for a reason! You are one of the following team members: ${teamMembers.join(', ')}.`
	);
	const systemMsgEnd = new SystemMessage(
		`Supervisor instructions: ${systemPrompt}\n` +
			`Remember, you individually can only use these tools: ${toolNames}` +
			'\n\nEnd if you have already completed the requested task. Communicate the work completed.'
	);

	return (state: typeof MessagesAnnotation.State): any[] => [systemMsgStart, ...state.messages, systemMsgEnd];
};
