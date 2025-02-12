export const ANALYTICS_MEMBERS = ['BiDashboards', 'Reports'];

export const ANALYTICS_MEMBERS_DESCRIPTION = {
	BiDashboards: `Questions regarding X
   - Examples:
     - "How do I assign a delivery to a driver?"
     - "What are the steps to integrate with an API?"`,
	Reports: `
   - Examples:
     - "What was the total revenue last month?"
     - "How many deliveries were completed yesterday?"
     - "What's the average delivery time per city?"
  `
} as { [key in (typeof ANALYTICS_MEMBERS)[number]]: string };
