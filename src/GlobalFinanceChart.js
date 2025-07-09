import React, { useEffect, useRef } from 'react';

const GlobalFinanceChart = ({ airports }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!airports || airports.length === 0) return;

    // Wait for AmCharts to be available
    const createChart = () => {
      if (window.am4core && window.am4charts && window.am4themes_animated) {
        const am4core = window.am4core;
        const am4charts = window.am4charts;
        const am4themes_animated = window.am4themes_animated;

        // Apply theme
        am4core.useTheme(am4themes_animated);

        // Create chart
        const chart = am4core.create(chartRef.current, am4charts.SankeyDiagram);
        chart.hiddenState.properties.opacity = 0;

        // Prepare data for revenue flow
        const chartData = [];
        
        // Group airports by region
        const regions = {};
        airports.forEach(airport => {
          const region = getRegion(airport.country);
          if (!regions[region]) {
            regions[region] = {
              totalRevenue: 0,
              totalPax: 0,
              airports: []
            };
          }
          const revenue = (airport.pax || 0) * (airport.spend_per_pax || 0);
          regions[region].totalRevenue += revenue;
          regions[region].totalPax += airport.pax || 0;
          regions[region].airports.push(airport);
        });

        // Create flow from regions to global hubs
        
        Object.keys(regions).forEach(region => {
          const regionData = regions[region];
          
          // Flow from region to major hubs (high volume airports)
          const majorHubsRevenue = regionData.airports
            .filter(airport => (airport.pax || 0) > 100000)
            .reduce((sum, airport) => sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
          
          if (majorHubsRevenue > 0) {
            chartData.push({
              from: region,
              to: "Major Hubs",
              value: majorHubsRevenue
            });
          }

          // Flow from region to regional centers (medium volume)
          const regionalRevenue = regionData.airports
            .filter(airport => (airport.pax || 0) > 50000 && (airport.pax || 0) <= 100000)
            .reduce((sum, airport) => sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
          
          if (regionalRevenue > 0) {
            chartData.push({
              from: region,
              to: "Regional Centers",
              value: regionalRevenue
            });
          }

          // Flow from region to local airports (low volume)
          const localRevenue = regionData.airports
            .filter(airport => (airport.pax || 0) <= 50000)
            .reduce((sum, airport) => sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
          
          if (localRevenue > 0) {
            chartData.push({
              from: region,
              to: "Local Airports",
              value: localRevenue
            });
          }
        });

        // Flow from hubs to revenue streams
        const totalMajorHubsRevenue = chartData
          .filter(item => item.to === "Major Hubs")
          .reduce((sum, item) => sum + item.value, 0);
        
        const totalRegionalRevenue = chartData
          .filter(item => item.to === "Regional Centers")
          .reduce((sum, item) => sum + item.value, 0);
        
        const totalLocalRevenue = chartData
          .filter(item => item.to === "Local Airports")
          .reduce((sum, item) => sum + item.value, 0);

        chartData.push(
          { from: "Major Hubs", to: "High Revenue", value: totalMajorHubsRevenue * 0.8 },
          { from: "Major Hubs", to: "Medium Revenue", value: totalMajorHubsRevenue * 0.2 },
          { from: "Regional Centers", to: "Medium Revenue", value: totalRegionalRevenue * 0.7 },
          { from: "Regional Centers", to: "Low Revenue", value: totalRegionalRevenue * 0.3 },
          { from: "Local Airports", to: "Low Revenue", value: totalLocalRevenue * 0.9 },
          { from: "Local Airports", to: "Medium Revenue", value: totalLocalRevenue * 0.1 }
        );

        chart.data = chartData;

        // Configure chart
        chart.dataFields.fromName = "from";
        chart.dataFields.toName = "to";
        chart.dataFields.value = "value";

        // Make nodes draggable
        const nodeTemplate = chart.nodes.template;
        nodeTemplate.inert = true;
        nodeTemplate.readerTitle = "Drag me!";
        nodeTemplate.showSystemTooltip = true;
        nodeTemplate.width = 20;

        // Hover state
        let hoverState = chart.links.template.states.create("hover");
        hoverState.properties.fillOpacity = 0.6;

        // Cleanup function
        return () => {
          if (chart) {
            chart.dispose();
          }
        };
      } else {
        // Retry after a short delay
        setTimeout(createChart, 100);
      }
    };

    createChart();
  }, [airports]);

  const getRegion = (country) => {
    const regionMap = {
      'United States': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      'United Kingdom': 'Europe',
      'Germany': 'Europe',
      'France': 'Europe',
      'Spain': 'Europe',
      'Italy': 'Europe',
      'China': 'Asia Pacific',
      'Japan': 'Asia Pacific',
      'India': 'Asia Pacific',
      'Australia': 'Asia Pacific',
      'United Arab Emirates': 'Middle East',
      'Saudi Arabia': 'Middle East',
      'Turkey': 'Europe',
      'South Africa': 'Africa',
      'Brazil': 'South America',
      'Argentina': 'South America'
    };
    return regionMap[country] || 'Other';
  };

  return (
    <div className="chart-container">
      <h3>Global Revenue Flow</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default GlobalFinanceChart; 