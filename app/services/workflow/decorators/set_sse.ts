import { Response } from 'express';

/**
 * Decorator that sets the headers for Server-Sent Events (SSE).
 */
export function SetSSE(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: any[]) {
		const response: Response = args[0];

		response.setHeader('Content-Type', 'text/event-stream');
		response.setHeader('Cache-Control', 'no-cache');
		response.setHeader('Connection', 'keep-alive');

		return await originalMethod.apply(this, args);
	};
	return descriptor;
}
