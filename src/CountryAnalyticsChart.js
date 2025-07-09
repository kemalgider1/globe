import React, { useEffect, useRef } from 'react';

const CountryAnalyticsChart = ({ airports, selectedCountry }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!airports || airports.length === 0 || !selectedCountry) return;

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
      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      xAxis.dataFields.category = "month";
      xAxis.renderer.grid.template.disabled = true;
      xAxis.renderer.minGridDistance = 30;

      const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
      yAxis.renderer.grid.template.disabled = true;

      // Create series for different metrics
      const createSeries = (field, name, color) => {
        const series = chart.series.push(new am4charts.StepLineSeries());
        series.dataFields.categoryX = "month";
        series.dataFields.valueY = field;
        series.name = name;
        series.stroke = am4core.color(color);
        series.strokeWidth = 3;
        series.tooltipText = "{name}: {valueY}";
        return series;
      };

      // Add series
      createSeries("pax", "Passenger Volume", "#ff0000");
      createSeries("revenue", "Revenue", "#00ff00");
      createSeries("pmi", "PMI Performance", "#0000ff");
      createSeries("marketShare", "Market Share", "#ffff00");

      // Add cursor
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.lineX.strokeOpacity = 0.2;
      chart.cursor.lineY.strokeOpacity = 0.2;

      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.position = "bottom";

      // Cleanup
      return () => {
        chart.dispose();
      };
    };

    loadAmCharts();
  }, [airports, selectedCountry]);

  const prepareChartData = (countryAirports) => {
    // Generate monthly data for the past 12 months
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7));
    }

    // Calculate base metrics
    const totalPax = countryAirports.reduce((sum, airport) => sum + (airport.pax || 0), 0);
    const totalRevenue = countryAirports.reduce((sum, airport) => 
      sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
    const avgPmi = countryAirports.reduce((sum, airport) => 
      sum + (airport.pmi_profit_pct || 0), 0) / countryAirports.length;

    // Generate trend data with seasonal variations
    const chartData = months.map((month, index) => {
      const seasonalFactor = 0.8 + 0.4 * Math.sin((index - 2) * Math.PI / 6);
      const trendFactor = 1 + (index / 12) * 0.2; // 20% growth over year
      
      return {
        month: month,
        pax: Math.round(totalPax * seasonalFactor * trendFactor * (0.9 + 0.2 * Math.random())),
        revenue: Math.round(totalRevenue * seasonalFactor * trendFactor * (0.9 + 0.2 * Math.random())),
        pmi: avgPmi + (Math.random() - 0.5) * 10,
        marketShare: 15 + Math.random() * 10 + (index * 0.5) // Gradual market share growth
      };
    });

    return chartData;
  };

  return (
    <div className="chart-container">
      <h3>Country Analytics - {selectedCountry?.properties?.ADMIN || selectedCountry?.properties?.NAME}</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default CountryAnalyticsChart; 