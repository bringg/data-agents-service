import { Security } from 'typescript-rest';

import { IS_DEV } from '../constants';

/**
 * A no-op function that satisfies the linter rules
 * Used for conditional decorators in development environment
 *
 * @returns A function that does nothing but satisfies the linter
 */
export const noOpDecorator = () => {
	// This function is intentionally empty but satisfies the linter
	// by returning a function that does something (returns undefined)
	return () => undefined;
};

/**
 * A conditional security decorator that only applies security in non-development environments
 *
 * @returns A decorator function that conditionally applies security
 */
export const conditionalSecurity = () => {
	return IS_DEV ? noOpDecorator() : Security('*', 'bringg-jwt');
};
