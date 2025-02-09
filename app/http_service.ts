import HttpServiceBuilder from '@bringg/service/lib/http_service_builder';
import express from 'express';

export const httpService = new HttpServiceBuilder()
	.useContext()
	.useRoot(__dirname)
	.useBodyParser(express.json({ limit: '50mb' }))
	.useServicePattern(...[`**/*controller.ts`])
	.build();
