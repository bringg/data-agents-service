import { BaseMessage } from '@langchain/core/messages';
import { Annotation, BinaryOperatorAggregate } from '@langchain/langgraph';
import { AnnotationRoot, StateType } from '@langchain/langgraph/dist/graph';

type AnalyticsAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<object, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
};

export type AnalyticsGraphStateType = AnnotationRoot<AnalyticsAnnotationRoot>;

export type AnalyticsWorkflowStateType = StateType<AnalyticsAnnotationRoot>;
