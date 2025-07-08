import React, { useState, useMemo } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import './AdvancedForecasting.css';

const AdvancedForecasting = ({ 
  timeSeriesData, 
  selectedAirport, 
  selectedCountry 
}) => {
  const [forecastModel, setForecastModel] = useState('linear');
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [activeAnalysis, setActiveAnalysis] = useState('forecast');

  // Advanced statistical forecasting algorithms
  const generateForecast = useMemo(() => {
    if (!timeSeriesData) return null;

    const data = timeSeriesData.datasets.passengers || [];
    if (data.length < 3) return null;

    switch (forecastModel) {
      case 'linear':
        return linearTrendForecast(data, forecastHorizon);
      case 'exponential':
        return exponentialSmoothingForecast(data, forecastHorizon);
      case 'seasonal':
        return seasonalDecompositionForecast(data, forecastHorizon);
      case 'arima':
        return arimaForecast(data, forecastHorizon);
      default:
        return linearTrendForecast(data, forecastHorizon);
    }
  }, [timeSeriesData, forecastModel, forecastHorizon]);

  // Linear Trend Forecasting with Confidence Intervals
  const linearTrendForecast = (data, periods) => {
    const n = data.length;
    if (n < 2) return null;

    // Calculate linear regression
    const xValues = data.map((_, i) => i);
    const yValues = data.map(point => point.y);
    
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = xValues[i] - xMean;
      const yDiff = yValues[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Calculate standard error
    const predictions = xValues.map(x => intercept + slope * x);
    const residuals = yValues.map((y, i) => y - predictions[i]);
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2);
    const standardError = Math.sqrt(mse);
    
    // Generate forecasts
    const forecasts = [];
    const lastDate = new Date(data[data.length - 1].x);
    
    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const x = n - 1 + i;
      const forecast = intercept + slope * x;
      
      // Calculate confidence interval
      const tValue = getTValue(confidenceLevel, n - 2);
      const xDiffSquared = Math.pow(x - xMean, 2);
      const xSumSquared = xValues.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0);
      const intervalWidth = tValue * standardError * Math.sqrt(1 + 1/n + xDiffSquared/xSumSquared);
      
      forecasts.push({
        x: futureDate,
        y: Math.max(0, forecast),
        upper: Math.max(0, forecast + intervalWidth),
        lower: Math.max(0, forecast - intervalWidth)
      });
    }
    
    return { forecasts, model: 'Linear Trend', r2: calculateR2(yValues, predictions) };
  };

  // Exponential Smoothing Forecast
  const exponentialSmoothingForecast = (data, periods) => {
    const alpha = 0.3; // Smoothing parameter
    const values = data.map(point => point.y);
    
    // Calculate smoothed values
    const smoothed = [values[0]];
    for (let i = 1; i < values.length; i++) {
      smoothed[i] = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
    }
    
    // Calculate trend
    const beta = 0.1;
    const trends = [smoothed[1] - smoothed[0]];
    for (let i = 1; i < smoothed.length - 1; i++) {
      trends[i] = beta * (smoothed[i + 1] - smoothed[i]) + (1 - beta) * trends[i - 1];
    }
    
    const lastSmoothed = smoothed[smoothed.length - 1];
    const lastTrend = trends[trends.length - 1];
    
    // Generate forecasts
    const forecasts = [];
    const lastDate = new Date(data[data.length - 1].x);
    
    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const forecast = lastSmoothed + i * lastTrend;
      const error = calculateForecastError(values, smoothed);
      
      forecasts.push({
        x: futureDate,
        y: Math.max(0, forecast),
        upper: Math.max(0, forecast + 1.96 * error),
        lower: Math.max(0, forecast - 1.96 * error)
      });
    }
    
    return { forecasts, model: 'Exponential Smoothing', error };
  };

  // Seasonal Decomposition Forecast
  const seasonalDecompositionForecast = (data, periods) => {
    const values = data.map(point => point.y);
    const seasonLength = 12; // Monthly seasonality
    
    if (values.length < seasonLength * 2) {
      return linearTrendForecast(data, periods);
    }
    
    // Calculate seasonal indices
    const seasonalIndices = calculateSeasonalIndices(values, seasonLength);
    
    // Deseasonalize data
    const deseasonalized = values.map((value, i) => 
      value / seasonalIndices[i % seasonLength]
    );
    
    // Fit trend to deseasonalized data
    const trendData = deseasonalized.map((value, i) => ({ x: i, y: value }));
    const trendForecast = linearTrendForecast(trendData, periods);
    
    if (!trendForecast) return null;
    
    // Reseasonalize forecasts
    const forecasts = trendForecast.forecasts.map((forecast, i) => {
      const seasonIndex = seasonalIndices[(values.length + i) % seasonLength];
      const lastDate = new Date(data[data.length - 1].x);
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i + 1);
      
      return {
        x: futureDate,
        y: Math.max(0, forecast.y * seasonIndex),
        upper: Math.max(0, forecast.upper * seasonIndex),
        lower: Math.max(0, forecast.lower * seasonIndex)
      };
    });
    
    return { forecasts, model: 'Seasonal Decomposition', seasonalIndices };
  };

  // ARIMA-like Forecast (Simplified)
  const arimaForecast = (data, periods) => {
    const values = data.map(point => point.y);
    
    // First difference to make stationary
    const diff1 = values.slice(1).map((val, i) => val - values[i]);
    
    // Calculate autoregressive parameters (AR1)
    const lag1Corr = calculateAutocorrelation(diff1, 1);
    
    // Generate forecasts
    const forecasts = [];
    const lastDate = new Date(data[data.length - 1].x);
    let lastDiff = diff1[diff1.length - 1];
    let lastValue = values[values.length - 1];
    
    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const nextDiff = lag1Corr * lastDiff;
      const nextValue = lastValue + nextDiff;
      
      const error = Math.sqrt(calculateVariance(diff1));
      
      forecasts.push({
        x: futureDate,
        y: Math.max(0, nextValue),
        upper: Math.max(0, nextValue + 1.96 * error),
        lower: Math.max(0, nextValue - 1.96 * error)
      });
      
      lastDiff = nextDiff;
      lastValue = nextValue;
    }
    
    return { forecasts, model: 'ARIMA(1,1,0)', autocorrelation: lag1Corr };
  };

  // Anomaly Detection
  const detectAnomalies = useMemo(() => {
    if (!timeSeriesData) return [];
    
    const data = timeSeriesData.datasets.passengers || [];
    const values = data.map(point => point.y);
    
    if (values.length < 3) return [];
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    const threshold = 2.5; // Z-score threshold
    
    return data.filter(point => {
      const zScore = Math.abs((point.y - mean) / stdDev);
      return zScore > threshold;
    }).map(point => ({
      ...point,
      anomalyType: point.y > mean ? 'spike' : 'dip',
      zScore: Math.abs((point.y - mean) / stdDev)
    }));
  }, [timeSeriesData]);

  // Utility functions
  const getTValue = (confidenceLevel, degreesOfFreedom) => {
    const tTable = {
      90: { 1: 6.314, 2: 2.920, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697 },
      95: { 1: 12.706, 2: 4.303, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042 },
      99: { 1: 63.657, 2: 9.925, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750 }
    };
    
    const table = tTable[confidenceLevel] || tTable[95];
    const df = Math.min(30, Math.max(1, degreesOfFreedom));
    
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    const closestDf = keys.find(key => key >= df) || keys[keys.length - 1];
    
    return table[closestDf];
  };

  const calculateR2 = (actual, predicted) => {
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSumSquares = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    return totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
  };

  const calculateForecastError = (actual, predicted) => {
    const errors = actual.map((val, i) => val - predicted[i]);
    const mse = errors.reduce((sum, err) => sum + err * err, 0) / errors.length;
    return Math.sqrt(mse);
  };

  const calculateSeasonalIndices = (values, seasonLength) => {
    const seasonalSums = new Array(seasonLength).fill(0);
    const seasonalCounts = new Array(seasonLength).fill(0);
    
    values.forEach((value, i) => {
      const seasonIndex = i % seasonLength;
      seasonalSums[seasonIndex] += value;
      seasonalCounts[seasonIndex]++;
    });
    
    const seasonalAverages = seasonalSums.map((sum, i) => 
      seasonalCounts[i] > 0 ? sum / seasonalCounts[i] : 1
    );
    
    const overallAverage = seasonalAverages.reduce((sum, avg) => sum + avg, 0) / seasonLength;
    
    return seasonalAverages.map(avg => avg / overallAverage);
  };

  const calculateAutocorrelation = (values, lag) => {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }
    
    for (let i = 0; i < n; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const calculateVariance = (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  };

  // Chart configurations
  const getForecastChartConfig = () => {
    if (!generateForecast || !timeSeriesData) return null;

    const historicalData = timeSeriesData.datasets.passengers || [];
    const { forecasts } = generateForecast;

    return {
      data: {
        datasets: [
          {
            label: 'Historical Data',
            data: historicalData,
            borderColor: '#00ffe7',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#00ffe7',
            pointRadius: 3
          },
          {
            label: 'Forecast',
            data: forecasts,
            borderColor: '#ff6b6b',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#ff6b6b',
            borderDash: [5, 5],
            pointRadius: 4
          },
          {
            label: 'Upper Bound',
            data: forecasts.map(f => ({ x: f.x, y: f.upper })),
            borderColor: 'rgba(255, 107, 107, 0.3)',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: '+1',
            pointRadius: 0
          },
          {
            label: 'Lower Bound',
            data: forecasts.map(f => ({ x: f.x, y: f.lower })),
            borderColor: 'rgba(255, 107, 107, 0.3)',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
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
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              }
            }
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
            ticks: { 
              color: '#ffffff',
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    };
  };

  const getAnomalyChartConfig = () => {
    if (!timeSeriesData) return null;

    const historicalData = timeSeriesData.datasets.passengers || [];
    const anomalies = detectAnomalies;

    return {
      data: {
        datasets: [
          {
            label: 'Normal Data',
            data: historicalData,
            borderColor: '#00ffe7',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#00ffe7',
            pointRadius: 3
          },
          {
            label: 'Anomalies',
            data: anomalies,
            borderColor: 'transparent',
            backgroundColor: '#ff4444',
            pointBackgroundColor: '#ff4444',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 1) {
                  const anomaly = anomalies[context.dataIndex];
                  return [
                    `Value: ${context.parsed.y.toLocaleString()}`,
                    `Type: ${anomaly.anomalyType}`,
                    `Z-Score: ${anomaly.zScore.toFixed(2)}`
                  ];
                }
                return `Value: ${context.parsed.y.toLocaleString()}`;
              }
            }
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
            ticks: { 
              color: '#ffffff',
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    };
  };

  const ModelMetrics = () => {
    if (!generateForecast) return null;

    const { model, r2, error, autocorrelation } = generateForecast;

    return (
      <div className="model-metrics">
        <h4>📊 Model Performance</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Model</div>
            <div className="metric-value">{model}</div>
          </div>
          
          {r2 !== undefined && (
            <div className="metric-card">
              <div className="metric-label">R²</div>
              <div className="metric-value">{r2.toFixed(3)}</div>
            </div>
          )}
          
          {error !== undefined && (
            <div className="metric-card">
              <div className="metric-label">RMSE</div>
              <div className="metric-value">{error.toFixed(0)}</div>
            </div>
          )}
          
          {autocorrelation !== undefined && (
            <div className="metric-card">
              <div className="metric-label">AR(1)</div>
              <div className="metric-value">{autocorrelation.toFixed(3)}</div>
            </div>
          )}
          
          <div className="metric-card">
            <div className="metric-label">Horizon</div>
            <div className="metric-value">{forecastHorizon}M</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Confidence</div>
            <div className="metric-value">{confidenceLevel}%</div>
          </div>
        </div>
      </div>
    );
  };

  const currentChart = activeAnalysis === 'forecast' ? getForecastChartConfig() : getAnomalyChartConfig();

  return (
    <div className="advanced-forecasting">
      <div className="forecasting-header">
        <h3>🔮 Advanced Forecasting & Analysis</h3>
        <div className="forecasting-controls">
          <select 
            value={forecastModel} 
            onChange={(e) => setForecastModel(e.target.value)}
            className="control-select"
          >
            <option value="linear">Linear Trend</option>
            <option value="exponential">Exponential Smoothing</option>
            <option value="seasonal">Seasonal Decomposition</option>
            <option value="arima">ARIMA</option>
          </select>
          
          <select 
            value={forecastHorizon} 
            onChange={(e) => setForecastHorizon(Number(e.target.value))}
            className="control-select"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
            <option value={24}>24 Months</option>
          </select>
          
          <select 
            value={confidenceLevel} 
            onChange={(e) => setConfidenceLevel(Number(e.target.value))}
            className="control-select"
          >
            <option value={90}>90% Confidence</option>
            <option value={95}>95% Confidence</option>
            <option value={99}>99% Confidence</option>
          </select>
        </div>
      </div>

      <div className="analysis-tabs">
        <button 
          className={activeAnalysis === 'forecast' ? 'active' : ''}
          onClick={() => setActiveAnalysis('forecast')}
        >
          🔮 Forecast
        </button>
        <button 
          className={activeAnalysis === 'anomaly' ? 'active' : ''}
          onClick={() => setActiveAnalysis('anomaly')}
        >
          🚨 Anomalies
        </button>
      </div>

      <div className="analysis-container">
        {currentChart && (
          <Line 
            data={currentChart.data} 
            options={currentChart.options}
            height={350}
          />
        )}
      </div>

      <ModelMetrics />

      {detectAnomalies.length > 0 && (
        <div className="anomaly-summary">
          <h4>🚨 Detected Anomalies</h4>
          <div className="anomaly-list">
            {detectAnomalies.slice(0, 5).map((anomaly, index) => (
              <div key={index} className="anomaly-item">
                <span className={`anomaly-type ${anomaly.anomalyType}`}>
                  {anomaly.anomalyType === 'spike' ? '📈' : '📉'} {anomaly.anomalyType}
                </span>
                <span className="anomaly-date">
                  {new Date(anomaly.x).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                  })}
                </span>
                <span className="anomaly-value">
                  {anomaly.y.toLocaleString()}
                </span>
                <span className="anomaly-score">
                  Z: {anomaly.zScore.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedForecasting;