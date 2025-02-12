import { BaseMessage } from '@langchain/core/messages';
import { BinaryOperatorAggregate, StateType, Annotation } from '@langchain/langgraph';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph';
import { ChatOpenAI } from '@langchain/openai';

type SuperAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<{}, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
	llm: typeof Annotation<ChatOpenAI>;
};

export type SuperGraphStateType = AnnotationRoot<SuperAnnotationRoot>;

export type MainWorkflowStateType = StateType<SuperAnnotationRoot>;
