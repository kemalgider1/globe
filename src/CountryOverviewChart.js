import React, { useEffect, useRef } from 'react';

const CountryOverviewChart = ({ airports, selectedCountry }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!airports || airports.length === 0 || !selectedCountry) return;

    // Wait for AmCharts to be available
    const createChart = () => {
      if (window.am4core && window.am4charts && window.am4themes_animated) {
        const am4core = window.am4core;
        const am4charts = window.am4charts;
        const am4themes_animated = window.am4themes_animated;

        // Apply theme
        am4core.useTheme(am4themes_animated);

        // Create chart
        const chart = am4core.create(chartRef.current, am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0;

        // Filter airports for selected country
        const countryAirports = airports.filter(airport => 
          airport.country === selectedCountry.properties.ADMIN || 
          airport.country === selectedCountry.properties.NAME
        );

        // Prepare data
        const chartData = prepareChartData(countryAirports);
        chart.data = chartData;

        // Create axes
        const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "airport";
        categoryAxis.renderer.grid.template.disabled = true;
        categoryAxis.renderer.minGridDistance = 30;

        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.grid.template.disabled = true;

        // Create series
        const series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "airport";
        series.dataFields.valueY = "totalRevenue";
        series.columns.template.tooltipText = "{airport}: {totalRevenue}";
        series.columns.template.fillOpacity = 0.8;
        series.columns.template.strokeOpacity = 0.2;
        series.columns.template.strokeWidth = 2;

        // Add pie charts inside columns
        series.columns.template.adapter.add("fill", (fill, target) => {
          const dataItem = target.dataItem;
          if (dataItem && dataItem.dataContext) {
            // Color based on performance
            const pmi = dataItem.dataContext.avgPmi || 0;
            if (pmi > 90) return am4core.color("#00ff00");
            if (pmi > 70) return am4core.color("#ffff00");
            if (pmi > 50) return am4core.color("#ff8000");
            return am4core.color("#ff0000");
          }
          return fill;
        });

        // Add labels
        series.columns.template.label.text = "{valueY}";
        series.columns.template.label.fontSize = 12;

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
  }, [airports, selectedCountry]);

  const prepareChartData = (countryAirports) => {
    // Group airports by size category
    const airportGroups = {
      'Large': [],
      'Medium': [],
      'Small': [],
      'Regional': []
    };

    countryAirports.forEach(airport => {
      const pax = airport.pax || 0;
      if (pax > 100000) airportGroups['Large'].push(airport);
      else if (pax > 50000) airportGroups['Medium'].push(airport);
      else if (pax > 10000) airportGroups['Small'].push(airport);
      else airportGroups['Regional'].push(airport);
    });

    // Create chart data
    const chartData = [];
    Object.keys(airportGroups).forEach(category => {
      const airports = airportGroups[category];
      if (airports.length === 0) return;

      const totalRevenue = airports.reduce((sum, airport) => 
        sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
      
      const totalPax = airports.reduce((sum, airport) => sum + (airport.pax || 0), 0);
      
      const avgPmi = airports.reduce((sum, airport) => 
        sum + (airport.pmi_profit_pct || 0), 0) / airports.length;

      chartData.push({
        airport: category,
        totalRevenue: totalRevenue,
        totalPax: totalPax,
        avgPmi: avgPmi,
        airportCount: airports.length
      });
    });

    return chartData;
  };

  return (
    <div className="chart-container">
      <h3>Country Overview - {selectedCountry?.properties?.ADMIN || selectedCountry?.properties?.NAME}</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default CountryOverviewChart; 