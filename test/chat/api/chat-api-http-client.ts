import { InteractiveClients } from '@bringg/service';
import { BaseHttpClient } from '@bringg/test-utils';
import { RouteResponse } from '../../__helper__/types';
import { ChatController } from '../../../app/domains/chat/chat_controller';

interface InitParams {
	merchantId: number;
	userId: number;
}

export class ChatHttpClient extends BaseHttpClient<InitParams> {
	public override async init({ merchantId, userId }: InitParams): Promise<this> {
		await this.setupWithIdentity({
			configOverride: {
				baseURL: '/chat'
			},
			identity: {
				merchantId,
				userId,
				audience: InteractiveClients.DASHBOARD_WEB
			}
		});

		return this;
	}

	public async newChatMessage(message: string, threadId?: string) {
		return await this.axios.get<RouteResponse<ChatController, 'newChatMessage'>>(`/${message}`, {
			params: { threadId }
		});
	}

	public async getChatHistory(threadId: string) {
		return await this.axios.get<RouteResponse<ChatController, 'getChatByThreadId'>>(`/history/${threadId}`);
	}
}
