import { BaseMessage } from '@langchain/core/messages';
import { BinaryOperatorAggregate, Annotation } from '@langchain/langgraph';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph';
import { ChatAI } from '../../../utils/llmFactory';

type AnalyticsAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<{}, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
	llm: typeof Annotation<ChatAI>;
};

export type AnalyticsGraphStateType = AnnotationRoot<AnalyticsAnnotationRoot>;
