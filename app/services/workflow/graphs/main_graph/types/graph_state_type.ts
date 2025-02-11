import { BaseMessage } from '@langchain/core/messages';
import { BinaryOperatorAggregate, StateType, Annotation } from '@langchain/langgraph';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph';

type MainAnnotationRoot = {
	user_input: typeof Annotation<string>;
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<{}, unknown>;
};

export type MainGraphStateType = AnnotationRoot<MainAnnotationRoot>;

export type MainWorkflowStateType = StateType<MainAnnotationRoot>;
