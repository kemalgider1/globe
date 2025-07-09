import React, { useEffect, useRef } from 'react';

const GlobalOverviewChart = ({ airports }) => {
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
        const chart = am4core.create(chartRef.current, am4charts.XYChart);
        chart.maskBullets = false;

        // Create axes
        const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

        xAxis.dataFields.category = "region";
        yAxis.dataFields.category = "performance";

        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.minGridDistance = 40;

        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.inversed = true;
        yAxis.renderer.minGridDistance = 30;

        // Create series
        const series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "region";
        series.dataFields.categoryY = "performance";
        series.dataFields.value = "value";
        series.sequencedInterpolation = true;
        series.defaultState.transitionDuration = 3000;

        const columnTemplate = series.columns.template;
        columnTemplate.strokeWidth = 2;
        columnTemplate.strokeOpacity = 1;
        columnTemplate.stroke = am4core.color("#ffffff");
        columnTemplate.tooltipText = "{region}, {performance}: {value.workingValue.formatNumber('#.')}";
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
        const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Africa', 'South America'];
        const performanceLevels = ['Excellent', 'Good', 'Average', 'Below Average'];
        
        const chartData = [];
        regions.forEach(region => {
          performanceLevels.forEach(level => {
            const regionAirports = airports.filter(airport => {
              const airportRegion = getRegion(airport.country);
              return airportRegion === region;
            });
            
            const count = regionAirports.filter(airport => {
              const pmi = airport.pmi_profit_pct || 0;
              if (level === 'Excellent') return pmi > 90;
              if (level === 'Good') return pmi > 70 && pmi <= 90;
              if (level === 'Average') return pmi > 50 && pmi <= 70;
              return pmi <= 50;
            }).length;
            
            chartData.push({
              region: region,
              performance: level,
              value: count
            });
          });
        });

        chart.data = chartData;

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
      <h3>Global Performance Overview</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default GlobalOverviewChart; 