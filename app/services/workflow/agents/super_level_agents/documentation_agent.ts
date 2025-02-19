import { HumanMessage } from '@langchain/core/messages';
import { SuperWorkflowStateType } from '../../graphs/super_graph/types';

export const documentationAgent = async (state: SuperWorkflowStateType) => {
	return {
		messages: [
			new HumanMessage({
				// content: 'In order to assign a delivery to a driver, you need to call the following number: 1-800-555-5555. That is it!',
				content: 'Im afraid I dont have the answers for that. ask HumanNode for clarifications from the user',
				name: 'DocumentationAgent'
			})
		]
	};
};
