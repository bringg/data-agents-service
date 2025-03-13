export const SUPER_MEMBERS = ['Documentation', 'AnalyticsTeam', 'HumanNode'];

export const SUPER_MEMBERS_DESCRIPTION = {
	Documentation: `Questions regarding how to operate or navigate the Bringg platform, which can be answered using the Bringg documentation.
   - Examples:
     - "How do I assign a delivery to a driver?"
     - "What are the steps to integrate with an API?"`,
	AnalyticsTeam: `Data-driven questions that can be answered using the company's database or BI dashboards, focusing on performance analysis, efficiency improvement, cost optimization, resource allocation, and issue identification.
   - Examples:
     - "What was the total revenue last month?"
     - "How many deliveries were completed yesterday?"
     - "List Teams/Drivers/Deliveries metrics/metadata."
     - "What's the average delivery time per city?"
     - **Efficiency & Performance:**
       - "How to improve my efficiency?"
       - "Why did my efficiency drop?"
       - "In which areas is my efficiency lower? Why?"
       - "How do I improve my drops per hour?"
       - "How fast do I deliver?"
       - "Do I deliver on my delivery promise?"
       - "How can I improve my delivery performance?"
       - "In which cases does my performance drop? (hour, day, location, season, product type, driver)"
       - "Why? (less resources in the DC, vehicle type, delivery mode, traffic, drivers)"
     - **Cost & Resource Optimization:**
       - "Where should I open a new fulfillment center?"
       - "Do I choose the right carriers?"
       - "Is my resource allocation optimized?"
       - "Is there any bottleneck around resources? (e.g. number of drivers or skills on specific slots, drivers with specific skills or specific vehicles for specific deliveries)"
       - "Where do I need to review the allocated capacity for delivery slots for the future:  Are there slots that are not used and should be removed and slots that are overbooked where capacity should be added?"
       - "What is my delivery cost?"
       - "What is my delivery cost per mode?"
       - "How did my delivery cost change in time? What are the reasons for the change?"
       - "How are my delivery costs divided between my own fleet and third party?"
       - "What are the cost variations between my different carriers? Compare the costs to on time delivery ratings. Could I switch volume from one carrier to another to reduce cost without harming performance?"
       - "Are the quotes from carriers different from the actual charge? What’s the delta? Is there a trend? Is the delta similar between carriers? Is there a carrier that overcharges constantly?"
       - "If I changed my resources allocation, how would my cost change?"
       - "What’s my vehicle utilisation? How would my delivery cost and on time delivery look if I added or removed a driver and/or a vehicle?"
       - "How would my delivery cost change if I used third parties in areas/timeslots where the vehicle utilisation is low?"
     - **Real-time Monitoring & Issue Detection (Order Dashboard related):**
       - "Look at my order dashboard. What should I pay attention to?" (Agent tries to answer to following:)
         - "Do I have the resources to deliver what’s planned tomorrow?"
         - "Give me a list of exceptions and their reason today"
         - "What are the orders that were late today and why?"
         - "What orders were canceled by carriers today?"
         - "Are the routes for today on time?"
         - "Is there any process today that’s not going according to the plan? (pickup, delivery)"
         - "Are there orders that are not allocated? Why?"
         - "Are there orders that need to be reassigned? Why?"
         - "Are there orders that will for sure be late? Why? Did we update the customers?"
       - "Is the ETOS correct?"
     - **Return & Cancellation Analysis:**
       - "Return orders - Yes or not the product was returned"
       - "Reason for rejecting inventory or cancellation - is there a change in the trend?"
       - "What are the main reasons my orders are late?"
       - "What are the main reasons my orders need to be reassigned?"
       - "What are the main reasons my orders are cancelled?"
       - "What are the main reasons my orders are rejected by carriers?"
     - **Driver Performance & Compliance:**
       - "How are my drivers performing?"
       - "Are they on time? Checkin proximity"
       - "Are they delivering according to the plan?"
       - "Are the customers satisfied with the drivers?"
       - "Do we have the same visibility for all the drivers?"
       - "Are they complying with the app required clicks (Is the driver using the driver app correctly (one click when they start the drive and one click when they delivered))"
       - "Are they complying with the legal requirements (e.g. breaks)?"
     - **Customer Feedback & Experience:**
       - "Which customers had a bad experience? Why?"
       - "Which customers rated the delivery?"
       - "Are there premium customers that complained about the delivery?"
       `,
	HumanNode: `Questions that require human intervention, such as those that are:
    - Too complex for the other members.
    - Require a human touch.
    - Needs clarification or further information.`
} as { [key in (typeof SUPER_MEMBERS)[number]]: string };
