import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, StateGraph, START, END, messagesStateReducer } from '@langchain/langgraph';
import { Response } from 'express';
import { semanticRouter } from '../agents/semantic_router_agent';
import { shouldContinue } from '../logic/should_continue';
import { toolNodes } from '../tools';

export const GraphState = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: messagesStateReducer,
		default: () => []
	})
});

const graph = new StateGraph(GraphState)
	.addNode('semanticRouter', semanticRouter)
	.addNode('tools', toolNodes)
	.addEdge(START, 'semanticRouter')
	.addConditionalEdges('semanticRouter', shouldContinue)
	.addEdge('tools', END)
	.compile();

export const callModel = async (userInput: string, threadId: string, response: Response) => {
	// Define graph variables
	const messages = [new HumanMessage(userInput)];
	const options = {
		recursionLimit: 15,
		version: 'v1' as 'v1' | 'v2',
		encoding: 'text/event-stream',
		configurable: { threadId }
	};

	// Set SSE headers
	response.setHeader('Content-Type', 'text/event-stream');
	response.setHeader('Cache-Control', 'no-cache');
	response.setHeader('Connection', 'keep-alive');

	const stream = graph.streamEvents({ messages }, { ...options });

	// Extract graph events and stream them back
	for await (const event of stream) {
		const kind = event.event;
		console.log(`${kind}: ${event.name}`);
		response.write(event.data);
		kind === 'on_chain_end' && response.end();
	}
};
