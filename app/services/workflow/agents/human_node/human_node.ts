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
	const threadId = config?.configurable?.thread_id as string;

	workflow.addConversationMessage(threadId, new HumanMessage({ content: content, name: 'HumanNode' }));

	// After interrupting the workflow will be returning automatically to the supervisor
	interrupt(content);
};
