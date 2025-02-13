import { BaseMessage } from '@langchain/core/messages';
import { BinaryOperatorAggregate, StateType, Annotation } from '@langchain/langgraph';
import { AnnotationRoot } from '@langchain/langgraph/dist/graph';
import { ChatAI } from '../../../utils/llmFactory';

type SuperAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<{}, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
	llm: typeof Annotation<ChatAI>;
};

export type SuperGraphStateType = AnnotationRoot<SuperAnnotationRoot>;

export type SuperWorkflowStateType = StateType<SuperAnnotationRoot>;
