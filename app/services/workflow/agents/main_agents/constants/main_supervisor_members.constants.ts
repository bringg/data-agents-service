export const mainSupervisorMembers = ['documentation', 'analytics_supervisor'];

export const mainSupervisorMembersDescription = {
	documentation: `Questions regarding how to operate or navigate the Bringg platform, which can be answered using the Bringg documentation.
   - Examples:
     - "How do I assign a delivery to a driver?"
     - "What are the steps to integrate with an API?"`,
	analytics_supervisor: `Data-driven questions that can be answered using the company's database or BI dashboards.
   - Examples:
     - "What was the total revenue last month?"
     - "How many deliveries were completed yesterday?"
     - "What's the average delivery time per city?"
  `
} as { [key in (typeof mainSupervisorMembers)[number]]: string };
