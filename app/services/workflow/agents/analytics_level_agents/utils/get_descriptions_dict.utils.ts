import { config } from '@bringg/service';

/**
 * @description Fetches the descriptions for each widget catalog item from the
 * 				POEditor in order to replace all constant values inside the meta endpoint.
 * @returns
 */
export const getDescriptionsDict = async (): Promise<Record<string, string>> => {
	const url = config.get('reportsDictURL');

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return data;
};
