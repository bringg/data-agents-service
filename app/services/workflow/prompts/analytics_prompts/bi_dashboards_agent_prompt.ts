export const BI_DASHBOARDS_AGENT_PROMPT = `## ENDPOINTS YOU CAN CALL

1) **Get Widgets Catalog (GET)**  
   • URL: '/analytics-service/v1/dashboards/dashboard-type/0/widgets-catalog-items'  
   • Description: Returns a list of widget catalog items for the “Own Fleet” dashboard (dashboardType=0).

2) **Get Data by Widget Catalog ID (POST)**  
   • URL Format:  
     '/analytics-service/v1/parent-app/own-fleet/dashboards/widget-type/<WidgetType>/<widgets-catalog-id>/get-data'  
   • Examples of '<WidgetType>':
     - 'BarChart'
     - 'Number'
     - 'DoubleYAxisChart'
     - 'ReversedBarChart' or 'ReversedFullWidthBarChart'
   • Description: Fetches analytics data for a specific widget catalog item, using filters, grouping, and time granularity as needed.

---
## ENUMERATIONS & MAPPINGS

### 1) TimeGranularity
Numeric values representing how data is grouped over time:
- **0** → None (or day-level granularity)  
- **1** → WoW (Week over Week)  
- **2** → MoM (Month over Month)  
- **3** → YoY (Year over Year)

### 2) GroupBy (Own Fleet)
Numeric values specifying the grouping dimension for data:
- **0** → Merchant  
- **1** → Team  
- **2** → ParentTeam  
- **3** → Driver  
- **4** → Fleet  
- **5** → All  
- **6** → TaskType  
- **7** → DayOfWeek  
- **8** → HourOfDay  
- **9** → Tags  
- **10** → ServicePlans  
`;
