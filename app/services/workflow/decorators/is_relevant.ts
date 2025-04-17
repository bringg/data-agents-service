import { HumanMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

import { SuperWorkflow, workflow } from '../graphs/super_graph';
import { checkQuestionRelevance } from '../utils';
/**
 * Decorator that checks if the first argument (assumed to be a question string)
 * is relevant before executing the decorated function.
 * If the question is not relevant (i.e. check returns "NO"), the original function is not executed.
 */
export function IsRelevant(
	_target: SuperWorkflow,
	_propertyKey: string,
	descriptor: PropertyDescriptor
): PropertyDescriptor {
	const originalMethod = descriptor.value;

	descriptor.value = async function (...args: Parameters<typeof workflow.streamGraph>): Promise<void> {
		// Destructure method arguments
		const [response, question, merchantId, userId, threadId] = args;

		const conversationHistory = threadId
			? await workflow.getConversationMessages(threadId, userId, merchantId)
			: [];

		const userMessage = new HumanMessage({
			content: question,
			name: 'User',
			additional_kwargs: { timestamp: new Date().toISOString() }
		});

		const fullConversation = [...conversationHistory, userMessage];

		const { isRelevant, description } = await checkQuestionRelevance(fullConversation);

		if (!isRelevant && description) {
			// In case that the first message in a new thread is not relevant, we need to create a new thread
			const currentThreadId = threadId ?? uuidv4();

			await workflow.addConversationMessages(currentThreadId, userId, merchantId, [
				userMessage,
				new HumanMessage({
					content: description as string,
					name: 'SemanticRouter',
					additional_kwargs: { timestamp: new Date().toISOString() }
				})
			]);

			workflow.writeToStream(response, currentThreadId, currentThreadId, 'ThreadId');
			workflow.writeToStream(response, currentThreadId, description, 'Non-Relevant');

			return;
		}

		return await originalMethod.apply(this, args);
	};

	return descriptor;
}
