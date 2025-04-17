import { Cube as BaseCube } from '@bringg/types';

/**
 * Extended Cube type that includes dependentCubes field
 * This extends the base Cube type from @bringg/types
 */
export interface ExtendedCube extends BaseCube {
	/**
	 * Array of dependent cubes that are related to this cube
	 */
	dependentCubes?: ExtendedCube[];
}

/**
 * Type for the formatted meta response that includes cube dependencies
 */
export interface FormattedMetaResponse {
	/**
	 * Record mapping cube names to their dependencies
	 */
	cubeDependencies: Record<string, string[]>;

	/**
	 * Array of measures
	 */
	measures: string[];

	/**
	 * Array of dimensions
	 */
	dimensions: string[];

	/**
	 */
	cubes: ExtendedCube[];
}
