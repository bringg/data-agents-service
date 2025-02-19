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
			//Set SSE headers
			response.setHeader('Content-Type', 'text/event-stream');
			response.setHeader('Cache-Control', 'no-cache');
			response.setHeader('Connection', 'keep-alive');

			response.write('event: Non-Relevant\n');
			response.write(
				`data: I'm Sorry, it's seems like your question isn't Bringg related. Try asking me another question!\n\n`
			);
			response.end();
			return;
		}
		return await originalMethod.apply(this, args);
	};
	return descriptor;
}
