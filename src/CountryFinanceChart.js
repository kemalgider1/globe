import React, { useEffect, useRef } from 'react';

const CountryFinanceChart = ({ airports, selectedCountry }) => {
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
      const chart = am4core.create(chartRef.current, am4charts.PieChart3D);
      chart.hiddenState.properties.opacity = 0;

      // Filter airports for selected country
      const countryAirports = airports.filter(airport => 
        airport.country === selectedCountry.properties.ADMIN || 
        airport.country === selectedCountry.properties.NAME
      );

      // Prepare data
      const chartData = prepareChartData(countryAirports);
      chart.data = chartData;

      // Configure chart
      chart.innerRadius = am4core.percent(40);
      chart.depth = 15;

      // Configure series
      const series = chart.series.push(new am4charts.PieSeries3D());
      series.dataFields.value = "revenue";
      series.dataFields.category = "category";
      series.slices.template.cornerRadius = 5;
      series.slices.template.strokeOpacity = 0.2;
      series.slices.template.strokeWidth = 2;

      // Configure labels
      series.labels.template.text = "{category}: {value}";
      series.labels.template.fontSize = 12;

      // Configure tooltips
      series.slices.template.tooltipText = "[bold]{category}[/]\nRevenue: {value}\nProfit Margin: {profitMargin}%";

      // Configure colors
      series.slices.template.adapter.add("fill", (fill, target) => {
        const dataItem = target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const profitMargin = dataItem.dataContext.profitMargin;
          if (profitMargin > 90) return am4core.color("#00ff00");
          if (profitMargin > 70) return am4core.color("#ffff00");
          if (profitMargin > 50) return am4core.color("#ff8000");
          return am4core.color("#ff0000");
        }
        return fill;
      });

      // Add height variation based on profit margin
      series.slices.template.adapter.add("radius", (radius, target) => {
        const dataItem = target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const profitMargin = dataItem.dataContext.profitMargin;
          return radius * (0.8 + (profitMargin / 100) * 0.4);
        }
        return radius;
      });

      // Cleanup
      return () => {
        chart.dispose();
      };
    };

    loadAmCharts();
  }, [airports, selectedCountry]);

  const prepareChartData = (countryAirports) => {
    // Group airports by performance level
    const performanceGroups = {
      'Excellent': { revenue: 0, profitMargin: 0, count: 0 },
      'Good': { revenue: 0, profitMargin: 0, count: 0 },
      'Average': { revenue: 0, profitMargin: 0, count: 0 },
      'Below Average': { revenue: 0, profitMargin: 0, count: 0 }
    };

    countryAirports.forEach(airport => {
      const revenue = (airport.pax || 0) * (airport.spend_per_pax || 0);
      const pmi = airport.pmi_profit_pct || 0;
      
      let category;
      if (pmi > 90) category = 'Excellent';
      else if (pmi > 70) category = 'Good';
      else if (pmi > 50) category = 'Average';
      else category = 'Below Average';

      performanceGroups[category].revenue += revenue;
      performanceGroups[category].profitMargin += pmi;
      performanceGroups[category].count += 1;
    });

    // Calculate average profit margins
    Object.keys(performanceGroups).forEach(category => {
      if (performanceGroups[category].count > 0) {
        performanceGroups[category].profitMargin = 
          performanceGroups[category].profitMargin / performanceGroups[category].count;
      }
    });

    // Convert to chart data
    const chartData = Object.keys(performanceGroups).map(category => ({
      category: category,
      revenue: performanceGroups[category].revenue,
      profitMargin: performanceGroups[category].profitMargin,
      count: performanceGroups[category].count
    })).filter(item => item.revenue > 0);

    return chartData;
  };

  return (
    <div className="chart-container">
      <h3>Country Finance - {selectedCountry?.properties?.ADMIN || selectedCountry?.properties?.NAME}</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default CountryFinanceChart; 