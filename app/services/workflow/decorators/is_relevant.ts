import { checkQuestionRelevance } from '../logic';

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
		const question: string = this.messages[0].content;

		const relevance = await checkQuestionRelevance(question);

		if (!relevance) {
			this.response.write(`data: Irrelevant question, skipping execution.\n\n`);
			this.response.end();
			return;
		}
		return await originalMethod.apply(this, args);
	};
	return descriptor;
}
