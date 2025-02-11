import { mainSupervisorMembers, mainSupervisorMembersDescription } from '../agents/main_agents/constants';

export const MAIN_SUPERVISOR_PROMPT = `You are a supervisor tasked with managing a conversation between the following
workers: ${mainSupervisorMembers.join(', ')}. Given the following user request,
please delegate the conversation to the appropriate worker by responding with it's name only.
Guidelines for delegation:
${mainSupervisorMembers.map(member => `${member}: ${mainSupervisorMembersDescription[member]}`).join('\n')} 
`;
