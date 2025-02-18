import { SUPER_MEMBERS, SUPER_MEMBERS_DESCRIPTION } from '../agents/super_level_agents/constants';

export const MAIN_SUPERVISOR_PROMPT = `You are a supervisor tasked with managing a conversation between the following
workers: ${SUPER_MEMBERS.join(', ')}. Given the following user request,
respond with the worker to act next. Each worker will perform a
task and respond with their results and status. When finished,
respond with FINISH.\n\n
Select strategically to minimize the number of steps taken.
Examples for delegation:
${SUPER_MEMBERS.map(member => `${member}: ${SUPER_MEMBERS_DESCRIPTION[member]}`).join('\n')} 
`;
