import { StateSnapshot } from '@langchain/langgraph';
import { checkQuestionRelevance } from '../utils';
import { Response } from 'express';
import { HumanMessage } from '@langchain/core/messages';
import { ERRORS } from '../../../common';

/**
 * Decorator that checks if the first argument (assumed to be a question string)
 * is relevant before executing the decorated function.
 * If the question is not relevant (i.e. check returns "NO"), the original function is not executed.
 */
export function IsRelevant(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: any[]) {
		// Get method arguments
		const question: string = args[1];
		const response: Response = args[0];
		const threadId: string | undefined = args[4];

		const { values }: StateSnapshot = threadId ? await this.getConversationByThreadID(threadId) : {};

		const conversationHistory = values ? values.messages : [];
		const fullConversation = [...conversationHistory, new HumanMessage(question)];

		const relevance = await checkQuestionRelevance(fullConversation);

		if (!relevance) {
			response.write('event: Non-Relevant\n');
			response.write(`data: ${ERRORS.BAD_INPUT}\n\n`);
			response.end();
			return;
		}
		return await originalMethod.apply(this, args);
	};
	return descriptor;
}
