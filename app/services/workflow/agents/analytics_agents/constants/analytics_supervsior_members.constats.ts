export const analyticsSupervisorMembers = ['bi_dashboards', 'reports'];

export const analyticsSupervisorMembersDescription = {
	bi_dashboards: `Questions regarding X
   - Examples:
     - "How do I assign a delivery to a driver?"
     - "What are the steps to integrate with an API?"`,
	reports: `
   - Examples:
     - "What was the total revenue last month?"
     - "How many deliveries were completed yesterday?"
     - "What's the average delivery time per city?"
  `
} as { [key in (typeof analyticsSupervisorMembers)[number]]: string };
