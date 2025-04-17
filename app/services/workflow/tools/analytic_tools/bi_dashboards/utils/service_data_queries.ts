import { Fleet, ServicePlan, Tag } from '@bringg/service-data';

interface ServiceDataItem {
	name: string;
	[key: string]: unknown;
}

const serviceDataQueries: Record<string, (merchantId: number) => Promise<ServiceDataItem[]>> = {
	fleets: (merchantId: number) => Fleet.findAll({ merchantId }),
	servicePlans: (merchantId: number) => ServicePlan.findAll({ merchantId }),
	tags: (merchantId: number) => Tag.findAll({ merchantId })
};

export const getServiceDataItems = async (type: keyof typeof serviceDataQueries, merchantId: number) => {
	const queryFn = serviceDataQueries[type];

	if (!queryFn) {
		throw new Error(`Unsupported type: ${type}`);
	}

	return queryFn(merchantId);
};
