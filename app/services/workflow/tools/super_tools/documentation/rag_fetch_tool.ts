import { config, logger } from '@bringg/service';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const ragFetchTool = tool(
	async ({ query }) => {
		const url = config.get('ragParams.url');
		const rag_corpus = config.get('ragParams.corpus');
		const jwt = process.env.GCLOUD_AUTH;

		const fullQuery = {
			vertex_rag_store: {
				rag_resources: {
					rag_corpus
				},
				vector_distance_threshold: 0.5
			},
			query: {
				text: query
			}
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(fullQuery)
		});

		if (!response.ok) {
			logger.error('Error getting docs RAG');
			throw new Error(`HTTP error! status: ${response.status}.`);
		}

		const data = await response.json();

		return data;
	},
	{
		name: 'rag_fetch_tool',
		description: 'Fetches RAG data of Bringg Docs',
		schema: z.object({
			query: z.string().nonempty(),
			reasoning: z.string().optional()
		})
	}
);
