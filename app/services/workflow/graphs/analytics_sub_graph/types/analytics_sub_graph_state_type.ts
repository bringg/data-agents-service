import { BaseMessage } from '@langchain/core/messages';
import { BinaryOperatorAggregate, StateType, Annotation } from '@langchain/langgraph';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph';
import { ChatOpenAI } from '@langchain/openai';

type AnalyticsAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<{}, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
	llm: typeof Annotation<ChatOpenAI>;
};

export type AnalyticsGraphStateType = AnnotationRoot<AnalyticsAnnotationRoot>;

export type AnalyticsMainWorkflowStateType = StateType<AnalyticsAnnotationRoot>;
