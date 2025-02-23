import { BaseMessage } from '@langchain/core/messages';
import { BinaryOperatorAggregate, StateType, Annotation } from '@langchain/langgraph';
import { AnnotationRoot, CompiledStateGraph, StateDefinition, UpdateType } from '@langchain/langgraph/dist/graph';
import { SUPER_MEMBERS } from '../../../agents/super_level_agents/constants';

type SuperAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	// conversation messages consists of messages that only the user can see
	conversation_messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<{}, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
};

export type SuperGraphStateType = AnnotationRoot<SuperAnnotationRoot>;

export type SuperWorkflowStateType = StateType<SuperAnnotationRoot>;

const superMembers = [...SUPER_MEMBERS, '__start__', 'Supervisor'] as const;

type SuperMembersType = (typeof superMembers)[number];

export type CompiledSuperWorkflowType = CompiledStateGraph<
	StateType<SuperAnnotationRoot>,
	UpdateType<SuperAnnotationRoot>,
	SuperMembersType,
	SuperAnnotationRoot,
	SuperAnnotationRoot,
	StateDefinition
>;
