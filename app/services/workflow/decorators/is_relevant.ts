import { checkQuestionRelevance } from '../utils';
import { Response } from 'express';

/**
 * Decorator that checks if the first argument (assumed to be a question string)
 * is relevant before executing the decorated function.
 * If the question is not relevant (i.e. check returns "NO"), the original function is not executed.
 */
export function IsRelevant(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: any[]) {
		// Retrieve the question from this.messages[0].content.
		// Adjust this extraction based on your actual HumanMessage structure.
		const question: string = args[1];
		const response: Response = args[0];

		const relevance = await checkQuestionRelevance(question);

		if (!relevance) {
			response.write(`data: Irrelevant question, skipping execution.\n\n`);
			response.end();
			return;
		}
		return await originalMethod.apply(this, args);
	};
	return descriptor;
}
