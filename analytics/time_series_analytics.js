import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import './TimeSeriesAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const TimeSeriesAnalytics = ({ 
  airports, 
  selectedAirport, 
  selectedCountry, 
  timeSeriesData 
}) => {
  const [activeChart, setActiveChart] = useState('passenger-trends');
  const [timeRange, setTimeRange] = useState('12M');
  const [aggregationLevel, setAggregationLevel] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('pax');

  // Generate synthetic time series data (replace with real PAX_FACT/PNL_FACT processing)
  const generateTimeSeriesData = useMemo(() => {
    if (!airports || airports.length === 0) return null;

    const currentDate = new Date();
    const months = timeRange === '12M' ? 12 : timeRange === '24M' ? 24 : 6;
    
    // Generate monthly data points
    const timePoints = Array.from({ length: months }, (_, i) => {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - (months - 1 - i));
      return date;
    });

    // If airport is selected, generate airport-specific data
    if (selectedAirport) {
      return generateAirportTimeSeries(selectedAirport, timePoints);
    }
    
    // If country is selected, aggregate country data
    if (selectedCountry) {
      const countryAirports = airports.filter(airport => 
        airport.country === selectedCountry.properties.ADMIN || 
        airport.country === selectedCountry.properties.NAME
      );
      return generateCountryTimeSeries(countryAirports, timePoints);
    }

    // Global aggregation
    return generateGlobalTimeSeries(airports, timePoints);
  }, [airports, selectedAirport, selectedCountry, timeRange]);

  // Generate airport-specific time series
  const generateAirportTimeSeries = (airport, timePoints) => {
    const basePax = airport.pax || 10000;
    const baseRevenue = basePax * (airport.spend_per_pax || 100);
    
    return {
      labels: timePoints.map(date => date.toISOString().slice(0, 7)),
      datasets: {
        passengers: timePoints.map((date, i) => ({
          x: date,
          y: Math.round(basePax * (0.8 + 0.4 * Math.random()) * getSeasonalFactor(date, 'pax'))
        })),
        revenue: timePoints.map((date, i) => ({
          x: date,
          y: Math.round(baseRevenue * (0.8 + 0.4 * Math.random()) * getSeasonalFactor(date, 'revenue'))
        })),
        profitMargin: timePoints.map((date, i) => ({
          x: date,
          y: (airport.pmi_profit_pct || 85) + (Math.random() - 0.5) * 10
        })),
        diversity: timePoints.map((date, i) => ({
          x: date,
          y: 0.3 + Math.random() * 0.5 // Nationality diversity score
        }))
      }
    };
  };

  // Generate country aggregated time series
  const generateCountryTimeSeries = (countryAirports, timePoints) => {
    const totalPax = countryAirports.reduce((sum, airport) => sum + (airport.pax || 0), 0);
    const totalRevenue = countryAirports.reduce((sum, airport) => 
      sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
    
    return {
      labels: timePoints.map(date => date.toISOString().slice(0, 7)),
      datasets: {
        passengers: timePoints.map(date => ({
          x: date,
          y: Math.round(totalPax * (0.9 + 0.2 * Math.random()) * getSeasonalFactor(date, 'pax'))
        })),
        revenue: timePoints.map(date => ({
          x: date,
          y: Math.round(totalRevenue * (0.9 + 0.2 * Math.random()) * getSeasonalFactor(date, 'revenue'))
        })),
        airports: timePoints.map(date => ({
          x: date,
          y: countryAirports.length + Math.round((Math.random() - 0.5) * 2)
        })),
        marketShare: timePoints.map(date => ({
          x: date,
          y: 15 + Math.random() * 10 // Market share percentage
        }))
      }
    };
  };

  // Generate global time series
  const generateGlobalTimeSeries = (airports, timePoints) => {
    const totalPax = airports.reduce((sum, airport) => sum + (airport.pax || 0), 0);
    const totalRevenue = airports.reduce((sum, airport) => 
      sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
    
    return {
      labels: timePoints.map(date => date.toISOString().slice(0, 7)),
      datasets: {
        passengers: timePoints.map(date => ({
          x: date,
          y: Math.round(totalPax * (0.95 + 0.1 * Math.random()) * getSeasonalFactor(date, 'pax'))
        })),
        revenue: timePoints.map(date => ({
          x: date,
          y: Math.round(totalRevenue * (0.95 + 0.1 * Math.random()) * getSeasonalFactor(date, 'revenue'))
        })),
        airports: timePoints.map(date => ({
          x: date,
          y: airports.length
        })),
        penetration: timePoints.map(date => ({
          x: date,
          y: 33 + (Math.random() - 0.5) * 5 // Market penetration %
        }))
      }
    };
  };

  // Seasonal factors for realistic data simulation
  const getSeasonalFactor = (date, metric) => {
    const month = date.getMonth();
    if (metric === 'pax') {
      // Summer peak, winter trough
      return 0.8 + 0.4 * Math.sin((month - 2) * Math.PI / 6);
    } else if (metric === 'revenue') {
      // Holiday seasons peak
      return month === 11 || month === 0 ? 1.3 : 
             month >= 5 && month <= 8 ? 1.2 : 1.0;
    }
    return 1.0;
  };

  // Statistical analysis functions
  const calculateTrend = (dataPoints) => {
    if (!dataPoints || dataPoints.length < 2) return { slope: 0, r2: 0 };
    
    const n = dataPoints.length;
    const xMean = (n - 1) / 2;
    const yMean = dataPoints.reduce((sum, point) => sum + point.y, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    dataPoints.forEach((point, i) => {
      const xDiff = i - xMean;
      const yDiff = point.y - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    });
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    
    // Calculate R²
    const predictions = dataPoints.map((_, i) => yMean + slope * (i - xMean));
    const totalSumSquares = dataPoints.reduce((sum, point) => 
      sum + Math.pow(point.y - yMean, 2), 0);
    const residualSumSquares = dataPoints.reduce((sum, point, i) => 
      sum + Math.pow(point.y - predictions[i], 2), 0);
    const r2 = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
    
    return { slope, r2: Math.max(0, r2) };
  };

  const calculateSeasonality = (dataPoints) => {
    if (!dataPoints || dataPoints.length < 12) return { amplitude: 0, phase: 0 };
    
    const values = dataPoints.map(point => point.y);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Simple seasonal amplitude calculation
    const detrended = values.map(val => val - mean);
    const amplitude = Math.max(...detrended) - Math.min(...detrended);
    
    return { amplitude: amplitude / mean, phase: 0 };
  };

  const calculateVolatility = (dataPoints) => {
    if (!dataPoints || dataPoints.length < 2) return 0;
    
    const values = dataPoints.map(point => point.y);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  };

  // Chart configurations
  const getChartConfig = (chartType) => {
    if (!generateTimeSeriesData) return null;

    const { datasets } = generateTimeSeriesData;
    
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#ffffff' }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#00ffe7',
          borderWidth: 1,
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              month: 'MMM yyyy'
            }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' }
        }
      }
    };

    switch (chartType) {
      case 'passenger-trends':
        return {
          data: {
            datasets: [{
              label: 'Passenger Volume',
              data: datasets.passengers,
              borderColor: '#00ffe7',
              backgroundColor: 'rgba(0, 255, 231, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              title: {
                display: true,
                text: 'Passenger Volume Trends',
                color: '#ffffff'
              }
            }
          }
        };

      case 'revenue-analysis':
        return {
          data: {
            datasets: [{
              label: 'Revenue (USD)',
              data: datasets.revenue,
              borderColor: '#ff6b6b',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              title: {
                display: true,
                text: 'Revenue Analysis',
                color: '#ffffff'
              }
            },
            scales: {
              ...baseOptions.scales,
              y: {
                ...baseOptions.scales.y,
                ticks: {
                  ...baseOptions.scales.y.ticks,
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            }
          }
        };

      case 'performance-metrics':
        const profitData = datasets.profitMargin || datasets.penetration;
        return {
          data: {
            datasets: [{
              label: selectedAirport ? 'Profit Margin (%)' : 'Market Penetration (%)',
              data: profitData,
              borderColor: '#4ecdc4',
              backgroundColor: 'rgba(78, 205, 196, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              title: {
                display: true,
                text: selectedAirport ? 'Profit Margin Trends' : 'Market Penetration',
                color: '#ffffff'
              }
            }
          }
        };

      case 'comparative-analysis':
        return {
          data: {
            datasets: [
              {
                label: 'Passengers (scaled)',
                data: datasets.passengers.map(point => ({ ...point, y: point.y / 1000 })),
                borderColor: '#00ffe7',
                backgroundColor: 'transparent',
                yAxisID: 'y'
              },
              {
                label: 'Revenue (scaled)',
                data: datasets.revenue.map(point => ({ ...point, y: point.y / 100000 })),
                borderColor: '#ff6b6b',
                backgroundColor: 'transparent',
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              title: {
                display: true,
                text: 'Passenger vs Revenue Correlation',
                color: '#ffffff'
              }
            },
            scales: {
              ...baseOptions.scales,
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#ffffff' }
              }
            }
          }
        };

      default:
        return null;
    }
  };

  // Statistical insights component
  const StatisticalInsights = () => {
    if (!generateTimeSeriesData) return null;

    const { datasets } = generateTimeSeriesData;
    const primaryData = datasets[selectedMetric] || datasets.passengers;
    
    const trend = calculateTrend(primaryData);
    const seasonality = calculateSeasonality(primaryData);
    const volatility = calculateVolatility(primaryData);

    return (
      <div className="statistical-insights">
        <h4>📊 Statistical Analysis</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-label">Trend</div>
            <div className={`insight-value ${trend.slope > 0 ? 'positive' : 'negative'}`}>
              {trend.slope > 0 ? '↗' : '↘'} {Math.abs(trend.slope).toFixed(2)}
            </div>
            <div className="insight-detail">R² = {trend.r2.toFixed(3)}</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-label">Seasonality</div>
            <div className="insight-value">
              {(seasonality.amplitude * 100).toFixed(1)}%
            </div>
            <div className="insight-detail">Amplitude</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-label">Volatility</div>
            <div className="insight-value">
              {(volatility * 100).toFixed(1)}%
            </div>
            <div className="insight-detail">Coefficient of Variation</div>
          </div>
          
          <div className="insight-card">
            <div className="insight-label">Data Points</div>
            <div className="insight-value">
              {primaryData.length}
            </div>
            <div className="insight-detail">Months</div>
          </div>
        </div>
      </div>
    );
  };

  const currentChart = getChartConfig(activeChart);

  return (
    <div className="time-series-analytics">
      <div className="analytics-header">
        <h3>📈 Time Series Analytics</h3>
        <div className="controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="control-select"
          >
            <option value="6M">6 Months</option>
            <option value="12M">12 Months</option>
            <option value="24M">24 Months</option>
          </select>
          
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="control-select"
          >
            <option value="pax">Passengers</option>
            <option value="revenue">Revenue</option>
            <option value="profitMargin">Profit Margin</option>
            <option value="diversity">Diversity</option>
          </select>
        </div>
      </div>

      <div className="chart-tabs">
        <button 
          className={activeChart === 'passenger-trends' ? 'active' : ''}
          onClick={() => setActiveChart('passenger-trends')}
        >
          Passenger Trends
        </button>
        <button 
          className={activeChart === 'revenue-analysis' ? 'active' : ''}
          onClick={() => setActiveChart('revenue-analysis')}
        >
          Revenue Analysis
        </button>
        <button 
          className={activeChart === 'performance-metrics' ? 'active' : ''}
          onClick={() => setActiveChart('performance-metrics')}
        >
          Performance
        </button>
        <button 
          className={activeChart === 'comparative-analysis' ? 'active' : ''}
          onClick={() => setActiveChart('comparative-analysis')}
        >
          Comparative
        </button>
      </div>

      <div className="chart-container">
        {currentChart && (
          <Line 
            data={currentChart.data} 
            options={currentChart.options}
            height={300}
          />
        )}
      </div>

      <StatisticalInsights />
    </div>
  );
};

export default TimeSeriesAnalytics;