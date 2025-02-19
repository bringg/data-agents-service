import { interrupt } from '@langchain/langgraph';
import { SuperWorkflow, SuperWorkflowStateType } from '../../graphs/super_graph';

export const humanNode = async (state: SuperWorkflowStateType) => {
	const { content } = await SuperWorkflow.llm.invoke(
		`A customer is going to read your output.
		 Transpile the given instructions onto a first-person conversation. Reply only with what
		  the customer needs to read. instructions: ${state.instructions}`
	);

	// After interrupting the workflow will be returning automatically to the supervisor
	interrupt(content);
};
