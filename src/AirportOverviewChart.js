import React, { useEffect, useRef } from 'react';

const AirportOverviewChart = ({ airports, selectedAirport }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!airports || airports.length === 0 || !selectedAirport) return;

    // Wait for AmCharts to be available
    const createChart = () => {
      if (window.am4core && window.am4charts && window.am4themes_animated) {
        const am4core = window.am4core;
        const am4charts = window.am4charts;
        const am4themes_animated = window.am4themes_animated;

        // Apply theme
        am4core.useTheme(am4themes_animated);

        // Create chart
        const chart = am4core.create(chartRef.current, am4charts.PieChart);
        chart.hiddenState.properties.opacity = 0;

        // Find the selected airport
        const airport = airports.find(a => 
          a.iata_code === selectedAirport.iata_code || 
          a.port_name === selectedAirport.port_name
        );

        if (!airport) return;

        // Prepare data
        const chartData = prepareChartData(airport);
        chart.data = chartData;

        // Configure chart
        chart.innerRadius = am4core.percent(50);
        chart.radius = am4core.percent(80);

        // Configure series
        const series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "value";
        series.dataFields.category = "category";
        series.slices.template.cornerRadius = 5;
        series.slices.template.strokeOpacity = 0.2;
        series.slices.template.strokeWidth = 2;

        // Configure labels
        series.labels.template.text = "{category}: {value}";
        series.labels.template.fontSize = 12;

        // Configure tooltips
        series.slices.template.tooltipText = "[bold]{category}[/]\n{value}";

        // Configure colors
        series.slices.template.adapter.add("fill", (fill, target) => {
          const dataItem = target.dataItem;
          if (dataItem && dataItem.dataContext) {
            const category = dataItem.dataContext.category;
            switch (category) {
              case 'Passenger Volume': return am4core.color("#ff0000");
              case 'Revenue': return am4core.color("#00ff00");
              case 'PMI Performance': return am4core.color("#0000ff");
              case 'Market Share': return am4core.color("#ffff00");
              default: return fill;
            }
          }
          return fill;
        });

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
  }, [airports, selectedAirport]);

  const prepareChartData = (airport) => {
    const pax = airport.pax || 0;
    const revenue = pax * (airport.spend_per_pax || 0);
    const pmi = airport.pmi_profit_pct || 0;
    const marketShare = airport.pmi_sob_pct || 0;

    return [
      {
        category: "Passenger Volume",
        value: pax,
        description: `${pax.toLocaleString()} passengers`
      },
      {
        category: "Revenue",
        value: revenue,
        description: `$${revenue.toLocaleString()}`
      },
      {
        category: "PMI Performance",
        value: pmi,
        description: `${pmi}% profit margin`
      },
      {
        category: "Market Share",
        value: marketShare,
        description: `${marketShare}% market share`
      }
    ];
  };

  return (
    <div className="chart-container">
      <h3>Airport Overview - {selectedAirport?.iata_code || selectedAirport?.port_name}</h3>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </div>
  );
};

export default AirportOverviewChart; 