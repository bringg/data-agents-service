import { HumanMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { interrupt } from '@langchain/langgraph';

import { SuperWorkflow, SuperWorkflowStateType, workflow } from '../../graphs/super_graph';

export const humanNode = async (state: SuperWorkflowStateType, config?: RunnableConfig): Promise<void> => {
	const { content } = await SuperWorkflow.llm.invoke([
		new HumanMessage(
			`A customer is going to read your output.
			Transpile the given instructions onto a first-person conversation. Reply only with what
			 the customer needs to read. instructions: ${state.instructions}`
		)
	]);

	// Save the interrupt to Redis
	const { thread_id, user_id, merchant_id } = config?.configurable || {};

	workflow.addConversationMessages(thread_id, user_id, merchant_id, [
		new HumanMessage({
			content: content,
			name: 'HumanNode',
			additional_kwargs: { timestamp: new Date().toISOString() }
		})
	]);

	// After interrupting the workflow will be returning automatically to the supervisor
	interrupt(content);
};
