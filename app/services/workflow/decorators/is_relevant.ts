import { HumanMessage } from '@langchain/core/messages';
import { Response } from 'express';

import { workflow } from '../graphs/super_graph';
import { checkQuestionRelevance } from '../utils';

/**
 * Decorator that checks if the first argument (assumed to be a question string)
 * is relevant before executing the decorated function.
 * If the question is not relevant (i.e. check returns "NO"), the original function is not executed.
 */
export function IsRelevant(_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
	const originalMethod = descriptor.value;

	descriptor.value = async function (...args: unknown[]): Promise<void> {
		// Get method arguments
		const question = args[1] as string;
		const response = args[0] as Response;
		const threadId = args[4] as string | undefined;
		const userId = args[3] as number;
		const merchantId = args[2] as number;

		/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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
			if (threadId) {
				await workflow.addConversationMessages(threadId, userId, merchantId, [
					userMessage,
					new HumanMessage({
						content: description as string,
						name: 'SemanticRouter',
						additional_kwargs: { timestamp: new Date().toISOString() }
					})
				]);
			}
			response.write(`id: ${threadId}\n`);
			response.write('event: Non-Relevant\n');
			response.write(`data: ${description.replace(/\n/g, '')}\n\n`);

			return;
		}

		return await originalMethod.apply(this, args);
	};

	return descriptor;
}
