import { BaseMessage } from '@langchain/core/messages';
import { Annotation, BinaryOperatorAggregate, StateType } from '@langchain/langgraph';
import { AnnotationRoot, CompiledStateGraph, StateDefinition, UpdateType } from '@langchain/langgraph/dist/graph';

import { SUPER_MEMBERS } from '../../../agents/super_level_agents/constants';

type SuperAnnotationRoot = {
	user_id: typeof Annotation<number>;
	merchant_id: typeof Annotation<number>;
	time_zone: typeof Annotation<string>;
	messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	// conversation messages consists of messages that only the user can see
	conversation_messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
	next: BinaryOperatorAggregate<object, unknown>;
	instructions: BinaryOperatorAggregate<string, string>;
	currency: typeof Annotation<string>;
};

export type SuperGraphStateType = AnnotationRoot<SuperAnnotationRoot>;

export type SuperWorkflowStateType = StateType<SuperAnnotationRoot>;

const _superMembers = [...SUPER_MEMBERS, '__start__', 'Supervisor'] as const;

type SuperMembersType = (typeof _superMembers)[number];

export type CompiledSuperWorkflowType = CompiledStateGraph<
	StateType<SuperAnnotationRoot>,
	UpdateType<SuperAnnotationRoot>,
	SuperMembersType,
	SuperAnnotationRoot,
	SuperAnnotationRoot,
	StateDefinition
>;

export type SSEEvent = 'ThreadId' | 'Status' | 'Response' | 'Error' | 'Non-Relevant' | 'Status-Description';
