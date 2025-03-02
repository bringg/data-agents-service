export const ANALYTICS_MEMBERS = ['BiDashboards', 'Reports'];

export const ANALYTICS_MEMBERS_DESCRIPTION = {
	BiDashboards: `Questions regarding the operational efficiency of order fulfillment—such as how long it
   takes from order creation to delivery, the success rates of orders, and the trends in delivery performance over time.
    Additionally, it can address queries regarding driver and carrier performance, customer satisfaction metrics, cancellation reasons, cost breakdowns, and overall route and team effectiveness.
  - Examples:
  - Average order duration from start to fulfillment.
 - Total number of successfully delivered orders.
 - Total number of individual customers with fulfilled orders.
 - Average time between start of order and its arrival at delivery location.
 - Average travel time between start of order and its arrival at final destination.
 - Trend of total number of done orders.
 - Total value of orders.
 - Total number of teams that recieved at least one order.
 - Trend of total number of teams that received at least one order.
 - Daily average value of fulfilled orders.
 - Comparison of total fulfilled orders between carriers.
 - The percentage of canceled orders.
 - Order duration, from creation to fulfillment.
 - Average travel time and time on site (TOS).
 - Average distance traveled to fulfill each order in a route.
 - Trend of average distance traveled to fullfill each order in a route.
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
	Reports: `
   - Examples:
     - "What was the total revenue last month?"
     - "How many deliveries were completed yesterday?"
     - "What's the average delivery time per city?"
  `
} as { [key in (typeof ANALYTICS_MEMBERS)[number]]: string };
