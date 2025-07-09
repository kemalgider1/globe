import React, { useEffect, useRef } from 'react';

const AirportAnalyticsChart = ({ airports, selectedAirport }) => {
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
      const chart = am4core.create(chartRef.current, am4charts.XYChart);
      chart.maskBullets = false;

      // Find the selected airport
      const airport = airports.find(a => 
        a.iata_code === selectedAirport.iata_code || 
        a.port_name === selectedAirport.port_name
      );

      if (!airport) return;

      // Create axes
      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

      xAxis.dataFields.category = "metric";
      yAxis.dataFields.category = "timeframe";

      xAxis.renderer.grid.template.disabled = true;
      xAxis.renderer.minGridDistance = 40;

      yAxis.renderer.grid.template.disabled = true;
      yAxis.renderer.inversed = true;
      yAxis.renderer.minGridDistance = 30;

      // Create series
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.categoryX = "metric";
      series.dataFields.categoryY = "timeframe";
      series.dataFields.value = "value";
      series.sequencedInterpolation = true;
      series.defaultState.transitionDuration = 3000;

      const columnTemplate = series.columns.template;
      columnTemplate.strokeWidth = 2;
      columnTemplate.strokeOpacity = 1;
      columnTemplate.stroke = am4core.color("#ffffff");
      columnTemplate.tooltipText = "{metric}, {timeframe}: {value.workingValue.formatNumber('#.')}";
      columnTemplate.width = am4core.percent(100);
      columnTemplate.height = am4core.percent(100);

      // Heat rules
      series.heatRules.push({
        target: columnTemplate,
        property: "fill",
        min: am4core.color("#ffffff"),
        max: am4core.color("#692155")
      });

      // Heat legend
      const heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend);
      heatLegend.width = am4core.percent(100);
      heatLegend.series = series;
      heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
      heatLegend.valueAxis.renderer.minGridDistance = 30;

      // Prepare data
      const chartData = prepareChartData(airport);
      chart.data = chartData;

      // Cleanup
      return () => {
        chart.dispose();
      };
    };

    loadAmCharts();
  }, [airports, selectedAirport]);

  const prepareChartData = (airport) => {
    const metrics = ['Passenger Volume', 'Revenue', 'PMI Performance', 'Market Share', 'Cost Efficiency'];
    const timeframes = ['Current', 'Monthly', 'Quarterly', 'Yearly'];
    
    const chartData = [];
    
    metrics.forEach(metric => {
      timeframes.forEach(timeframe => {
        let value;
        
        switch (metric) {
          case 'Passenger Volume':
            value = airport.pax || 0;
            if (timeframe === 'Monthly') value *= 12;
            else if (timeframe === 'Quarterly') value *= 4;
            else if (timeframe === 'Yearly') value *= 1;
            break;
            
          case 'Revenue':
            value = (airport.pax || 0) * (airport.spend_per_pax || 0);
            if (timeframe === 'Monthly') value *= 12;
            else if (timeframe === 'Quarterly') value *= 4;
            else if (timeframe === 'Yearly') value *= 1;
            break;
            
          case 'PMI Performance':
            value = airport.pmi_profit_pct || 0;
            if (timeframe === 'Monthly') value *= 0.9;
            else if (timeframe === 'Quarterly') value *= 0.95;
            else if (timeframe === 'Yearly') value *= 1.05;
            break;
            
          case 'Market Share':
            value = airport.pmi_sob_pct || 0;
            if (timeframe === 'Monthly') value *= 0.8;
            else if (timeframe === 'Quarterly') value *= 0.9;
            else if (timeframe === 'Yearly') value *= 1.1;
            break;
            
          case 'Cost Efficiency':
            value = airport.cot_cc_pct || 85;
            if (timeframe === 'Monthly') value *= 0.95;
            else if (timeframe === 'Quarterly') value *= 0.98;
            else if (timeframe === 'Yearly') value *= 1.02;
            break;
            
          default:
            value = 0;
        }
        
        chartData.push({
          metric: metric,
          timeframe: timeframe,
          value: value
        });
      });
    });
    
    return chartData;
  };

  return (
    <div className="chart-container">
      <h3>Airport Analytics - {selectedAirport?.iata_code || selectedAirport?.port_name}</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default AirportAnalyticsChart; 