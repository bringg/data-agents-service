import { config } from '@bringg/service'
import { prestoClient } from '@bringg/service-data';
import { User as UserModel } from '@bringg/service-data';

function getRole(roles: { admin: boolean; driver: boolean; dispatcher: boolean }): string | null {
    return Object.entries(roles)
        .find(([_, value]) => value)?.[0] || null;
}

// Example usage:
const role = getRole({ admin: false, driver: true, dispatcher: false });

// TODO: Delete the default values for userId and merchantId
export async function getUserProfile(userId: number = 2288, merchantId: number = 14302647) {
    const user = await UserModel.find(merchantId , userId);

    const userTeamsRestrictions = user.team_ids ?? [];
    const userRole = getRole({ admin: user.admin, driver: user.driver, dispatcher: user.dispatcher });

    client = await prestoClient.init({ ...config.get('presto'), clientName: 'sync-way-point-service-areas' });

}

