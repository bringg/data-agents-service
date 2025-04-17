import { Response } from 'express';

/**
 * Decorator that sets the headers for Server-Sent Events (SSE).
 */
export function SetSSE(_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
	const originalMethod = descriptor.value;

	descriptor.value = async function (...args: unknown[]): Promise<void> {
		const response = args[0] as Response;

		response.setHeader('Content-Type', 'text/event-stream');
		response.setHeader('Cache-Control', 'no-cache');
		response.setHeader('Connection', 'keep-alive');

		return await originalMethod.apply(this, args);
	};

	return descriptor;
}
