import { throwProblem } from '@bringg/service';
import { StatusCodes } from 'http-status-codes';
import { ServiceContext } from 'typescript-rest';

import { IS_DEV } from '../constants';

/**
 * Validates the user and returns the userId and merchantId as numbers.
 * @param context - The service context containing the request
 * @returns { userId: number, merchantId: number }
 */
export function validateUser(context: ServiceContext): { userId: number; merchantId: number } {
	// For dev purposes
	if (IS_DEV) {
		return { userId: 10267117, merchantId: 2288 };
	}

	const { userId, merchantId } = context.request.user || {};

	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
	if (!userId || !merchantId) {
		throwProblem(StatusCodes.UNAUTHORIZED, 'Missing user id');
	}

	return { userId, merchantId };
}
