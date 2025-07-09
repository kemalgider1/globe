import React, { useEffect, useRef } from 'react';

const GlobalAnalyticsChart = ({ airports }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!airports || airports.length === 0) return;

    const processData = (airports) => {
      // Group airports by region, then by performance level
      const regions = {};
      airports.forEach(airport => {
        const region = getRegion(airport.country);
        const performance = getPerformanceLevel(airport.pmi_profit_pct || 0);
        const revenue = (airport.pax || 0) * (airport.spend_per_pax || 0);
        if (!regions[region]) {
          regions[region] = {
            name: region,
            value: 0,
            children: {}
          };
        }
        if (!regions[region].children[performance]) {
          regions[region].children[performance] = {
            name: performance,
            value: 0,
            children: []
          };
        }
        regions[region].value += revenue;
        regions[region].children[performance].value += revenue;
        regions[region].children[performance].children.push({
          name: airport.iata_code || airport.port_name || 'Unknown',
          value: revenue,
          pax: airport.pax || 0,
          pmi: airport.pmi_profit_pct || 0
        });
      });
      // Convert to AmCharts format
      const result = {
        name: "Global Network",
        children: Object.values(regions).map(region => ({
          name: region.name,
          value: region.value,
          children: Object.values(region.children).map(perf => ({
            name: perf.name,
            value: perf.value,
            children: perf.children
          }))
        }))
      };
      return result;
    };

    // Wait for AmCharts to be available
    const createChart = () => {
      if (window.am4core && window.am4charts && window.am4themes_animated) {
        const am4core = window.am4core;
        const am4charts = window.am4charts;
        const am4themes_animated = window.am4themes_animated;
        am4core.useTheme(am4themes_animated);
        const chart = am4core.create(chartRef.current, am4charts.TreeMap);
        chart.hiddenState.properties.opacity = 0;
        const chartData = processData(airports);
        chart.data = chartData;
        chart.dataFields.value = "value";
        chart.dataFields.name = "name";
        chart.dataFields.children = "children";
        const series = chart.seriesTemplates.create("0");
        series.columns.template.fillOpacity = 0.8;
        series.columns.template.strokeOpacity = 0.2;
        series.columns.template.strokeWidth = 2;
        series.columns.template.tooltipText = "[bold]{name}[/]\nValue: {value}";
        series.labels.template.text = "{name}";
        series.columns.template.heatRules.push({
          target: series.columns.template,
          property: "fill",
          min: am4core.color("#ffffff"),
          max: am4core.color("#692155")
        });
        return () => {
          chart.dispose();
        };
      } else {
        setTimeout(createChart, 100);
      }
    };
    createChart();
    // eslint-disable-next-line
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

  const getPerformanceLevel = (pmi) => {
    if (pmi > 90) return 'Excellent';
    if (pmi > 70) return 'Good';
    if (pmi > 50) return 'Average';
    return 'Below Average';
  };

  return (
    <div className="chart-container">
      <h3>Global Analytics Drill-Down</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default GlobalAnalyticsChart; 