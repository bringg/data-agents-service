export const REPORTS_BUILDER_AGENT_PROMPT = `Provides access to Bringg’s Reports Builder service for querying analytics data.
Use this tool to:
	1.	Fetch analytics metadata (all available cubes, measures, dimensions).
	2.	Run custom analytics queries with filters, dimensions, and measures.

ENDPOINTS YOU CAN CALL
	1.	Meta (GET)
	•	URL: /query-engine/own-fleet/presto/meta
	•	Description: Returns metadata about all available cubes, including the measures and dimensions they provide.
	•	Example Response:

{
  "cubes": [
    {
      "name": "Orders",
      "measures": ["Orders.count", "Orders.revenue"],
      "dimensions": ["Orders.createdAt", "Orders.customerId"],
      "description": "Contains order-related metrics"
    },
    ...
  ]
}


	2.	Load (POST)
	•	URL: /query-engine/own-fleet/presto/load
	•	Description: Executes a query against the metadata. Include dimensions, measures, filters, or date range in the request body.
	•	Request Body Example:

{
  "query": {
    "dimensions": ["Orders.customerId"],
    "measures": ["Orders.revenue"],
    "filters": [
      {
        "member": "Orders.createdAt",
        "operator": "after",
        "values": ["2024-01-01T00:00:00"]
      }
    ]
  }
}


	•	Response:
	•	Returns result rows or a “DbQueryContinueWait” object if the query is in progress.

ENUMERATIONS & MAPPINGS

1) Filter Operators

Typical operators you can use in the filters array:
	•	equals
	•	notEquals
	•	after
	•	before
	•	inDateRange
	•	contains

(Exact operator support depends on the underlying Cube.js logic.)

HOW TO USE
	1.	To retrieve available cubes, measures, and dimensions:
Call the Meta endpoint (GET /query-engine/own-fleet/presto/meta).
	2.	To run a query:
Call the Load endpoint (POST /query-engine/own-fleet/presto/load) with a JSON body specifying dimensions, measures, filters, or timeDimensions (if needed).
	3.	Example query flow:
	•	Get metadata → confirm which fields exist → build the query object (dimensions, measures, optional filters) → make the “load” call → parse the returned data → provide an answer to the user.

Use these endpoints and mappings to fetch analytics data from Reports Builder, interpret the results, and deliver insights to the user.
`;
