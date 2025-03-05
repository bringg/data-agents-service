import { InteractiveClients } from '@bringg/service';
import { BaseHttpClient } from '@bringg/test-utils';

import { ChatController } from '../../../app/domains/chat/chat_controller';
import { ContinueChatDto, NewChatDto } from '../../../app/domains/chat/types';
import { RouteResponse } from '../../__helper__/types';

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

	public async newChat(payload: NewChatDto) {
		return await this.axios.post<RouteResponse<ChatController, 'newChat'>>('/', payload);
	}

	public async continueChat(threadId: string, payload: ContinueChatDto) {
		return await this.axios.post<RouteResponse<ChatController, 'continueChat'>>(`/${threadId}`, payload);
	}

	public async getChatByThreadId(threadId: string) {
		return await this.axios.get<RouteResponse<ChatController, 'getChatByThreadId'>>(`/${threadId}`);
	}
}
