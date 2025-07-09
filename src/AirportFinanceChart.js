import React, { useEffect, useRef } from 'react';

const AirportFinanceChart = ({ airports, selectedAirport }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!airports || airports.length === 0 || !selectedAirport) return;

    // Load AmCharts
    const loadAmCharts = async () => {
      await import('@amcharts/amcharts4/core');
      await import('@amcharts/amcharts4/charts');
      await import('@amcharts/amcharts4/themes/animated');
      
      const am4core = window.am4core;
      const am4charts = window.am4charts;
      const am4themes_animated = window.am4themes_animated;

      // Apply theme
      am4core.useTheme(am4themes_animated);

      // Create chart
      const chart = am4core.create(chartRef.current, am4charts.ChordDiagram);
      chart.hiddenState.properties.opacity = 0;

      // Find the selected airport
      const airport = airports.find(a => 
        a.iata_code === selectedAirport.iata_code || 
        a.port_name === selectedAirport.port_name
      );

      if (!airport) return;

      // Prepare data
      const chartData = prepareChartData(airport, airports);
      chart.data = chartData;

      // Configure chart
      chart.dataFields.fromName = "from";
      chart.dataFields.toName = "to";
      chart.dataFields.value = "value";

      // Configure nodes
      const nodeTemplate = chart.nodes.template;
      nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
      nodeTemplate.showSystemTooltip = true;
      nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;

      // Configure links
      const linkTemplate = chart.links.template;
      linkTemplate.readerTitle = "Click to show/hide";
      linkTemplate.showSystemTooltip = true;
      linkTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;

      // Add hover state
      let hoverState = chart.links.template.states.create("hover");
      hoverState.properties.fillOpacity = 0.6;

      // Cleanup
      return () => {
        chart.dispose();
      };
    };

    loadAmCharts();
  }, [airports, selectedAirport]);

  const prepareChartData = (selectedAirport, allAirports) => {
    const chartData = [];
    
    // Find top connected airports (based on proximity and performance)
    const connectedAirports = allAirports
      .filter(airport => airport.iata_code !== selectedAirport.iata_code)
      .sort((a, b) => {
        // Sort by PMI performance and passenger volume
        const aScore = (a.pmi_profit_pct || 0) * (a.pax || 0);
        const bScore = (b.pmi_profit_pct || 0) * (b.pax || 0);
        return bScore - aScore;
      })
      .slice(0, 5); // Top 5 connected airports

    // Create connections from selected airport to top performers
    connectedAirports.forEach((connectedAirport, index) => {
      const connectionValue = (selectedAirport.pax || 0) * (connectedAirport.pmi_profit_pct || 0) / 1000;
      
      chartData.push({
        from: selectedAirport.iata_code || selectedAirport.port_name,
        to: connectedAirport.iata_code || connectedAirport.port_name,
        value: connectionValue
      });
    });

    // Add connections between top performers
    for (let i = 0; i < connectedAirports.length; i++) {
      for (let j = i + 1; j < connectedAirports.length; j++) {
        const value = (connectedAirports[i].pax || 0) * (connectedAirports[j].pmi_profit_pct || 0) / 2000;
        chartData.push({
          from: connectedAirports[i].iata_code || connectedAirports[i].port_name,
          to: connectedAirports[j].iata_code || connectedAirports[j].port_name,
          value: value
        });
      }
    }

    return chartData;
  };

  return (
    <div className="chart-container">
      <h3>Airport Finance - {selectedAirport?.iata_code || selectedAirport?.port_name}</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default AirportFinanceChart; 