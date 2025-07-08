1. Rationale for Country Examples (Turkey, China, USA)
Why those countries?
They represent distinct market archetypes:
...SCRAP THAT
Check charts.py in analytics folder. Repeat the sunburst chart by regions, countries, airports as 3 level 
People can click on each level to see the data on the dashboard. the variable is gonna be the revenue margin


2. Time Series for PAX Nationality
Excellent idea!
User flow: User picks a nationality (flag), and sees a monthly time series of PAX for that nationality, globally or per airport.
Where? This fits best in the Analytics tab, or as a drill-down from the nationality table in Overview.


3. Sankey Graph Example
What is a Sankey graph good for?
Flow visualization: Shows how something splits or merges between categories.
Best use with your data:
PAX Nationality Flows: Show how passengers of different nationalities are distributed across top airports or countries.
Example: "Where do Chinese passengers travel most?" → Sankey: "China" → [Top destination airports/countries].
Or: "How does total PAX split by region, then by airport size category?"
Where? Analytics tab, or as a deep-dive from a nationality/country/airport selection.

this is pretty much what we I sait at 1 both seem plausible.


4. Critical Assessment of Global Overview (from screenshots)
Sections Identified:
Global DF-MACASE Overview   -REMOVE THIS TITLE
KPIs: Total airports, countries, PAX, revenue

image.png (Just the structure of it can be copied)


Market penetration, spend per PAX, profit margin, data quality
Circular progress charts for penetration and margin

Make it cooler merge them into one chart two different variables.

Top 9 Nationalities why 9 and not 10?
Again either lets give something like a top 10 race chart or a table.

Table: Nationality, PAX
Total PAX of selected nationalities


Financial Overview
PAX spent on PMI, total PAX, % CC users, % PMI CC purchases
Circular progress charts for %s
Strengths
Clear, concise KPIs: The most important global numbers are front and center.
Visuals: Progress circles and tables are easy to scan.
Segmentation: Nationality table gives a sense of market composition.
Financial focus: Revenue and spend per PAX are highlighted.
Areas for Improvement / Suggestions
Trend/Time Series Missing
No sense of change over time (e.g., monthly/quarterly PAX, revenue, penetration).
Add: Small line chart or sparkline for global PAX/revenue trend.
No Interactivity
Can't click a nationality to see more (e.g., time series, breakdown by country/airport).
Add: Clickable rows in nationality table to drill down.
No Geographic Visualization
No map or globe in the panel itself (though likely present elsewhere).
Add: Mini-map or sparkline showing top countries/regions.
No Flow/Distribution Visualization
No Sankey, pie, or bar chart showing how PAX/revenue splits by region, size, or other categories.
Add: Small Sankey or stacked bar for "PAX by region → by airport size".
No Benchmarking
No comparison to previous period, targets, or global averages.
Add: Up/down arrows or % change vs last year/quarter.
Data Quality
Good to show, but could be more granular (e.g., "Data 100% complete for 90% of airports").
Summary Table of Global Overview Sections (from screenshots)
Section	Purpose	Strengths	Suggestions for Improvement
Global DF-MACASE KPIs	Top-level global metrics	Clear, concise, visual	Add time series, benchmarking
Top 9 Nationalities	Market composition by PAX	Segmentation, actionable	Make interactive, add drill-down
Financial Overview	Revenue, spend, CC usage	Financial focus, visuals	Add trends, breakdowns, benchmarks



Next Steps for Global Overview Design
Keep: The current KPI and summary structure (very strong foundation).
Add:
Mini time series for PAX/revenue/penetration.
Clickable/interactivity for nationality table.
Small Sankey or stacked bar for PAX/revenue flow.
Benchmarks/period comparisons (e.g., vs last year). 
We can have pax  level yoy etc
Plan for drill-downs: Clicking a nationality, country, or airport should open time series, flows, or deeper analytics.

