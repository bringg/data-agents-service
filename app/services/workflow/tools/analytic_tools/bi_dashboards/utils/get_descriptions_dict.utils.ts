import { config } from '@bringg/service';

export const getDescriptionsDict = async () => {
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
