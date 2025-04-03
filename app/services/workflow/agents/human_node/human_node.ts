import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableConfig } from '@langchain/core/runnables';
import { interrupt } from '@langchain/langgraph';

import { SuperWorkflow, SuperWorkflowStateType, workflow } from '../../graphs/super_graph';

export const humanNode = async (state: SuperWorkflowStateType, config?: RunnableConfig): Promise<void> => {
	const prompt = ChatPromptTemplate.fromMessages([
		[
			'system',
			`A customer is going to read your output.
			Transpile the given Supervisor's request onto a first-person conversation with the customer. Reply only with what
			 the customer needs to read`
		],
		new MessagesPlaceholder('messages')
	]);

	const formattedPrompt = await prompt.formatMessages({
		messages: [new HumanMessage({ content: state.instructions, name: 'Supervisor' })]
	});

	const { content } = await SuperWorkflow.userFacingLLM.invoke(formattedPrompt);

	// Save the interrupt to Redis
	const { thread_id } = config?.configurable || {};

	workflow.addConversationMessages(thread_id, state.user_id, state.merchant_id, [
		new HumanMessage({
			content: content,
			name: 'HumanNode',
			additional_kwargs: { timestamp: new Date().toISOString() }
		})
	]);

	// After interrupting the workflow will be returning automatically to the supervisor
	interrupt(content);
};
