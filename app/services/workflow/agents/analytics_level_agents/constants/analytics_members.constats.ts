export const ANALYTICS_MEMBERS = ['BiDashboards', 'Reports', 'Analyzer'];

export const ANALYTICS_MEMBERS_DESCRIPTION = {
	BiDashboards: `Questions regarding the operational efficiency of order fulfillment—such as how long it
   takes from order creation to delivery, the success rates of orders, and the trends in delivery performance over time.
    Additionally, it can address queries regarding driver and carrier performance, customer satisfaction metrics, cancellation reasons, cost breakdowns, and overall route and team effectiveness.
      The BiDashboards worker uses a set of predefined widgets and metrics to answer common operational and performance questions quickly.

  **Best for:**
    - Aggregated data and overviews of key metrics (e.g., success rates, average durations, cost breakdowns).
    - Quick filters and group-bys for known data points (e.g., carrier, team, timeframe).
    - Trend analyses that already exist in out-of-the-box dashboards.

  If a question fits into these existing widgets and does not require building a brand new query or listing raw-level records, BiDashboards is typically faster and more efficient.

  **Examples of questions BiDashboards can answer:**
  - Average order duration from start to fulfillment.
 - Total number of successfully delivered orders.
 - Total number of individual customers with fulfilled orders.
 - Average time between start of order and its arrival at delivery location.
 - Average travel time between start of order and its arrival at final destination.
 - Trend of total number of done orders.
 - Total value of orders.
 - Total number of teams that received at least one order.
 - Trend of total number of teams that received at least one order.
 - Daily average value of fulfilled orders.
 - Comparison of total fulfilled orders between carriers.
 - The percentage of canceled orders.
 - Order duration, from creation to fulfillment.
 - Average travel time and time on site (TOS).
 - Average distance traveled to fulfill each order in a route.
 - Trend of average distance traveled to fulfill each order in a route.
 - Percentage of orders that arrived early, late or on time at pickup location.
 - Orders delivered on time.
 - The percentage of done orders with customers who used driver tracking.
 - Percentage of customers who provided CSAT score.
 - Average customer satisfaction (CSAT) score.
 - Total number of canceled orders, and percentage canceled out of all orders.
 - Total number of completed orders and percentage completed out of all orders.
 - Average time it takes to assign drivers to orders.
 - Average time on site (TOS) driver spends at fulfillment destination.
 - Average driver time on site (TOS) at pickup location.
 - Trend of average time it takes to assign drivers to orders.
 - Trend of average driver time on site (TOS) at pickup location.
 - Trend of average time on site (TOS) driver spends at delivery location.
 - Average time from driver assignment to their arrival at the fulfillment center.
 - Trend of average time from AD assignment of a driver to their arrival at the first stop.
 - Average number of orders per route.
 - Average distance drivers travel per route.
 - Trend of average distance drivers travel per route.
 - Percentage of orders automatically assigned using AutoDispatch.
 - Percentage of orders automatically assigned using AutoDispatch.
 - Average number of orders drivers fulfill per hour of the day.
 - Trend of avg. number of orders drivers fulfill per hour of the day.  Considers the entire order without separating pickup and drop off.
 - Percentage of orders that arrived early, late, or on time at the final destination, based on schedule.
 - Comparison of the distribution of CSAT scores.
 - Percent of times a carrier causes an order cancellation before pick up.
 - Frequency with which a carrier accepts orders for delivery.
 - Total amount of money each carrier charges.
 - Frequency with which a carrier's actual delivery time aligns with its ETA.
 - Total number of returned orders.
 - Trend of total number of returned orders.
 - Trend of average amount each carrier charges on different days of the week.
 - Average amount each carrier charges at different hours of the day.
 - Percentage of orders that arrived early, on time, or late at the final destination.
 - Total number of successfully created orders.
 - Total number of unique routes with successfully fulfilled orders.
 - The degree to which orders arrived late relative to their time windows.
 - The degree to which orders arrived late relative to their scheduled time.
 - Average delivery cost of done orders.
 - Total number of drivers that received and fulfilled at least one order.
 - Average route duration from its start to end.
 - Trend of order duration, from creation to pickup.
 - Percent of times a carrier causes an order cancellation after pick up and before drop-off.
 - Total number of times a carrier causes an order cancellation at any point during the process.
 - Trend of duration per order stage, from creation to fulfillment.
 - Total Linked Orders
 - Total value of orders per route.
 - Total number of vehicles that received at least one order.
 - A breakdown of how many orders were canceled by a carrier at each stage of the fulfillment process.
 - Trend of order duration, from creation to leaving service location.
 - The frequency with which each reason for canceling an order was chosen.
 - The frequency with which customers chose each reason for selecting a given CSAT score.
 - Rate of orders delivered early.
 - Rate of orders delivered late.
 - A composite score each driver receives based on various performance-related parameters.
 - A breakdown of the distance from where a driver checked into the customer location relative to the location itself.
 - An aggregated breakdown of each driver's highest and lowest CSAT rating alongside orders that did not receive a rating.
 - Count of completed orders that did and did not meet all three compliance benchmarks relating to timing and accuracy of the deliveries.
 - Total distance traveled of all completed (ended) routes in a time period.
 - Average number of successfully delivered orders per route.
 - Average route duration from its start time to the end time of the last order (task) on the route.
  `,
	Reports: `The Reports Builder is a self-serve tool that allows users to create custom BI reports by dragging and dropping data fields from key operational areas such as
  orders, shipments, vehicles, users, and carriers. It helps answer questions about order fulfillment performance, driver and carrier efficiency, shipment tracking, and overall operational trends.
  Users can filter data by different time periods, apply custom calculations, and compare data across teams, regions, or workflows.
  Pre-built system reports are also available for quick access to commonly requested insights.
  The tool empowers operational teams, analysts, and managers to make data-driven decisions, identify inefficiencies, and track performance in real time.
  The Reports worker is a more flexible, custom query builder.

  **Best for:**
    - Detailed, field-level data exploration that goes beyond existing dashboard widgets.
    - Constructing new calculations or combining multiple data sources not covered in BiDashboards.
    - Pulling detailed lists (e.g., all orders and their timestamps, who canceled each one, etc.).
    - Fine-grained filtering that extends beyond standard filters (e.g., filtering by obscure fields or multi-step queries).

   **Examples:**
     - "What was the total revenue last month?"
     - "How many deliveries were completed yesterday?"
     - "What's the average delivery time per city?"
     - "Compare the predicted routes with the actual routes, highlighting gaps in start time, duration, distance and time at the customer site."
     - "View all orders created in the last seven days, their status, and a summary of key fulfillment details."
     - "View a list of your own drivers who worked on a specific day, including their start and end times, and total shift hours."
     - "View all alerts in a given time frame to identify and troubleshoot delivery issues."
     - "View all executed automation workflows by date and outcome to troubleshoot issues."
     - "View the utilization of future slot capacity by skill and location, and adjust resources based on availability."
     - 'View a breakdown of all orders canceled within the last 7 days, including who canceled them and why."
     - "View all orders completed over the last seven days, including their status and which drivers completed them."
     - "Time Last Time Driver Logged In"
     - "Compare the promised with the actual time the driver arrived at the customer destination."
     - "Get Driver/Team/.../ ID by name."
     - "List all available types of Service Types."
     - "Analyze the frequencies and types of consumer cancellation reasons, potentially joining with Orders (\`Tasks\`) to see which order types are most affected."
     - "Identify specific customers and analyze their order history or feedback by joining with Orders (\`Tasks\`) or Ratings (\`TaskRating\`)."
     - "Analyze inventory quantities, weights, rejections, and scanning activities specifically at the first order stop."
     - "Analyze the final state of inventory, including accepted/rejected quantities and scanning activities, at the last order stop."
     - "Retrieve and analyze specific instructions or issues recorded as notes during the first stop of an order."
     - "Retrieve and analyze delivery instructions or notes recorded upon completion at the final stop of an order."
     - "Analyze overall route efficiency, performance KPIs like deliveries per hour, and deviations from planned time/distance by joining with Orders (\`Tasks\`) or Drivers (\`Users\`)."
     - "Analyze customer notification success rates and engagement with order tracking features."
     - "Analyze average customer ratings, review feedback comments, and correlate ratings with order or driver details by joining with Orders (\`Tasks\`)."
     - "Analyze the frequency, timing, and reasons drivers reject order assignments."
     - "Track order statuses, analyze volumes, completion rates, financial performance, and join with data from other areas for contextual analysis."
     - "Filter operational data or aggregate performance metrics at the team level by joining with Orders (\`Tasks\`), Drivers (\`Users\`), or Routes (\`Runs\`)."
     - "Identify drivers, analyze their assigned orders or route performance by joining with Orders (\`Tasks\`) or Routes (\`Runs\`), and filter operations based on driver attributes."
     - "Analyze performance metrics (on-time arrival, time on site), driver actions (scans, photos), and location details specifically for the first stop."
     - "Analyze final delivery performance (on-time, time on site), proof of delivery actions, and location details for the last stop."
     - "Evaluate carrier reliability, analyze acceptance/completion rates, monitor on-time performance, and compare costs across different third-party fleets."
     - "Currently offers limited direct analysis, potentially used internally or for future features related to reassignment tracking."
     - "Primarily facilitates joins or internal calculations for route performance metrics rather than direct standalone analysis."
     - "Analyze the frequency, types, severity, and resolution of operational alerts generated by the system."
     - "Monitor the execution frequency, success/failure rates, and outcomes of automated system workflows."
     - "Analyze and monitor the utilization rates of defined delivery capacity slots based on time, team, or service area."
     - "Perform in-depth analysis of route plan adherence by comparing planned vs. actual time, distance, and efficiency metrics per route or driver."
     - "Track driver shift durations and analyze productivity based on completed orders per shift."
     - "Measure the efficiency of time, weight, and handling unit utilization for delivery resources or routes."
     - "Get detailed profiles for all system users, analyze activity across different roles, and link user information to operational data."
     - "Maintain a vehicle inventory and analyze performance or assignment patterns by vehicle attributes or type by joining with Routes (\`Runs\`) or Orders (\`Tasks\`)."
     - "Understand the standard capabilities and constraints of different vehicle types used in operations joined with the specific vehicle data (\`VehiclesModel\`)."
  `,
	Analyzer: `The Analytics worker is responsible for combining, interpreting, and synthesizing results from other members (BiDashboards and Reports) to produce a final, cohesive answer.

  **Best for:**
  Use the Analytics worker when you have partial data or insights returned from one or more members and need to:
  - Merge or compare them.
  - Perform additional calculations on the returned data (e.g., ranking, cross-referencing, final aggregates).
  - Translate multiple sub-answers into a single response for the user.`
} as { [key in (typeof ANALYTICS_MEMBERS)[number]]: string };
