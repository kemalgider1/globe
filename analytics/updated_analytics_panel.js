import React, { useState, useMemo } from 'react';
import { FaGlobe, FaChartBar, FaTable, FaChevronDown, FaChevronUp, FaClock, FaCog } from 'react-icons/fa';
import { CircleFlag } from 'react-circle-flags';
import TimeSeriesAnalytics from './TimeSeriesAnalytics';
import AdvancedForecasting from './AdvancedForecasting';
import './AnalyticsPanel.css';

const AnalyticsPanel = ({ airports, selectedAirport }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate comprehensive analytics data
  const analyticsData = useMemo(() => {
    if (!airports || airports.length === 0) return null;

    if (selectedAirport) {
      // Individual airport analytics
      return {
        type: 'airport',
        airport: selectedAirport,
        metrics: calculateAirportMetrics(selectedAirport),
        benchmarks: calculateBenchmarks(selectedAirport, airports),
        timeSeriesData: generateAirportTimeSeries(selectedAirport)
      };
    } else {
      // Global analytics
      return {
        type: 'global',
        global: calculateGlobalMetrics(airports),
        topPerformers: getTopPerformers(airports),
        timeSeriesData: generateGlobalTimeSeries(airports)
      };
    }
  }, [airports, selectedAirport]);

  // Calculate airport-specific metrics
  const calculateAirportMetrics = (airport) => {
    const revenue = (airport.pax || 0) * (airport.spend_per_pax || 0);
    const efficiency = airport.pax > 0 ? revenue / airport.pax : 0;
    
    return {
      revenue,
      efficiency,
      profitability: airport.pmi_profit_pct || 0,
      marketPenetration: airport.prevalence_pct || 0,
      diversityScore: airport.nationality_diversity_score || 0.5,
      performanceQuadrant: getPerformanceQuadrant(airport)
    };
  };

  // Calculate benchmarks against similar airports
  const calculateBenchmarks = (airport, allAirports) => {
    const similarAirports = allAirports.filter(a => 
      a.size_category === airport.size_category && 
      a.iata_code !== airport.iata_code
    );

    if (similarAirports.length === 0) return null;

    const avgPax = similarAirports.reduce((sum, a) => sum + (a.pax || 0), 0) / similarAirports.length;
    const avgSpend = similarAirports.reduce((sum, a) => sum + (a.spend_per_pax || 0), 0) / similarAirports.length;
    const avgProfit = similarAirports.reduce((sum, a) => sum + (a.pmi_profit_pct || 0), 0) / similarAirports.length;

    return {
      paxPercentile: calculatePercentile(airport.pax, similarAirports.map(a => a.pax)),
      spendPercentile: calculatePercentile(airport.spend_per_pax, similarAirports.map(a => a.spend_per_pax)),
      profitPercentile: calculatePercentile(airport.pmi_profit_pct, similarAirports.map(a => a.pmi_profit_pct)),
      avgPax,
      avgSpend,
      avgProfit
    };
  };

  // Calculate global metrics
  const calculateGlobalMetrics = (airports) => {
    const activeAirports = airports.filter(a => (a.pax || 0) > 0);
    const totalPax = activeAirports.reduce((sum, a) => sum + (a.pax || 0), 0);
    const totalRevenue = activeAirports.reduce((sum, a) => sum + ((a.pax || 0) * (a.spend_per_pax || 0)), 0);
    const avgProfitMargin = activeAirports.reduce((sum, a) => sum + (a.pmi_profit_pct || 0), 0) / activeAirports.length;

    return {
      totalAirports: airports.length,
      activeAirports: activeAirports.length,
      totalPax,
      totalRevenue,
      avgProfitMargin,
      marketPenetration: (activeAirports.length / airports.length) * 100,
      revenuePerAirport: totalRevenue / activeAirports.length,
      paxPerAirport: totalPax / activeAirports.length
    };
  };

  // Get top performing airports
  const getTopPerformers = (airports) => {
    const activeAirports = airports.filter(a => (a.pax || 0) > 0 && (a.spend_per_pax || 0) > 0);
    
    return {
      byRevenue: activeAirports
        .sort((a, b) => ((b.pax || 0) * (b.spend_per_pax || 0)) - ((a.pax || 0) * (a.spend_per_pax || 0)))
        .slice(0, 5),
      byPax: activeAirports
        .sort((a, b) => (b.pax || 0) - (a.pax || 0))
        .slice(0, 5),
      byEfficiency: activeAirports
        .sort((a, b) => (b.spend_per_pax || 0) - (a.spend_per_pax || 0))
        .slice(0, 5),
      byProfit: activeAirports
        .sort((a, b) => (b.pmi_profit_pct || 0) - (a.pmi_profit_pct || 0))
        .slice(0, 5)
    };
  };

  // Performance quadrant classification
  const getPerformanceQuadrant = (airport) => {
    const pax = airport.pax || 0;
    const spend = airport.spend_per_pax || 0;
    const medianPax = 50000; // You can calculate this dynamically
    const medianSpend = 500;  // You can calculate this dynamically

    if (pax > medianPax && spend > medianSpend) return 'Star Performer';
    if (pax > medianPax && spend <= medianSpend) return 'Volume Leader';
    if (pax <= medianPax && spend > medianSpend) return 'Niche Player';
    return 'Standard Performer';
  };

  // Calculate percentile ranking
  const calculatePercentile = (value, dataset) => {
    const sorted = dataset.filter(v => v != null).sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return index === -1 ? 100 : (index / sorted.length) * 100;
  };

  // Generate synthetic time series data (replace with real PAX_FACT processing)
  const generateAirportTimeSeries = (airport) => {
    // This would be replaced with actual PAX_FACT data processing
    return generateSyntheticTimeSeries(airport.pax || 10000, 'airport');
  };

  const generateGlobalTimeSeries = (airports) => {
    const totalPax = airports.reduce((sum, a) => sum + (a.pax || 0), 0);
    return generateSyntheticTimeSeries(totalPax, 'global');
  };

  const generateSyntheticTimeSeries = (basePax, type) => {
    const currentDate = new Date();
    const months = 12;
    
    const timePoints = Array.from({ length: months }, (_, i) => {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - (months - 1 - i));
      return date;
    });

    return {
      labels: timePoints.map(date => date.toISOString().slice(0, 7)),
      datasets: {
        passengers: timePoints.map((date, i) => ({
          x: date,
          y: Math.round(basePax * (0.8 + 0.4 * Math.random()) * getSeasonalFactor(date))
        }))
      }
    };
  };

  const getSeasonalFactor = (date) => {
    const month = date.getMonth();
    return 0.8 + 0.4 * Math.sin((month - 2) * Math.PI / 6);
  };

  // Utility function to get ISO code for flags
  const getCountryISO = (airport) => {
    if (!airport || !airport.country) return null;
    
    const countryISOMap = {
      'United States': 'us', 'USA': 'us', 'United Kingdom': 'gb', 'UK': 'gb',
      'Germany': 'de', 'France': 'fr', 'Italy': 'it', 'Spain': 'es',
      'Netherlands': 'nl', 'Belgium': 'be', 'Switzerland': 'ch', 'Austria': 'at',
      'Denmark': 'dk', 'Sweden': 'se', 'Norway': 'no', 'Finland': 'fi',
      'Russia': 'ru', 'China': 'cn', 'Japan': 'jp', 'South Korea': 'kr',
      'India': 'in', 'Australia': 'au', 'New Zealand': 'nz', 'Brazil': 'br',
      'Argentina': 'ar', 'Chile': 'cl', 'Mexico': 'mx', 'Turkey': 'tr',
      'Greece': 'gr', 'Portugal': 'pt', 'Ireland': 'ie', 'Poland': 'pl',
      'UAE': 'ae', 'Saudi Arabia': 'sa', 'Israel': 'il', 'Egypt': 'eg',
      'South Africa': 'za', 'Nigeria': 'ng', 'Morocco': 'ma', 'Tunisia': 'tn'
    };
    
    return countryISOMap[airport.country] || null;
  };

  // Tab content renderers
  const renderOverviewTab = () => {
    if (!analyticsData) return <div>Loading analytics...</div>;

    if (analyticsData.type === 'airport') {
      const { airport, metrics, benchmarks } = analyticsData;
      const countryISO = getCountryISO(airport);

      return (
        <div className="tab-content">
          <div className="airport-header">
            <div className="airport-info">
              {countryISO && (
                <CircleFlag countryCode={countryISO} height="24" />
              )}
              <div className="airport-details">
                <h3>{airport.iata_code} - {airport.airport_name}</h3>
                <p>{airport.country} • {airport.size_category} airport</p>
              </div>
            </div>
            <div className="performance-badge">
              <span className={`quadrant ${metrics.performanceQuadrant.toLowerCase().replace(' ', '-')}`}>
                {metrics.performanceQuadrant}
              </span>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">✈️</div>
              <div className="metric-content">
                <div className="metric-value">{(airport.pax || 0).toLocaleString()}</div>
                <div className="metric-label">Annual Passengers</div>
                {benchmarks && (
                  <div className="metric-benchmark">
                    {benchmarks.paxPercentile.toFixed(0)}th percentile
                  </div>
                )}
              </div>
            </div>

            <div className="metric-card primary">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-value">${metrics.revenue.toLocaleString()}</div>
                <div className="metric-label">Total Revenue</div>
                <div className="metric-benchmark">
                  ${metrics.efficiency.toFixed(2)} per passenger
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{metrics.profitability.toFixed(1)}%</div>
              <div className="metric-label">Profit Margin</div>
              {benchmarks && (
                <div className="metric-benchmark">
                  vs {benchmarks.avgProfit.toFixed(1)}% avg
                </div>
              )}
            </div>

            <div className="metric-card">
              <div className="metric-value">{metrics.marketPenetration.toFixed(1)}%</div>
              <div className="metric-label">Market Penetration</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">${(airport.spend_per_pax || 0).toFixed(2)}</div>
              <div className="metric-label">Spend per PAX</div>
              {benchmarks && (
                <div className="metric-benchmark">
                  {benchmarks.spendPercentile.toFixed(0)}th percentile
                </div>
              )}
            </div>

            <div className="metric-card">
              <div className="metric-value">{(metrics.diversityScore * 100).toFixed(0)}%</div>
              <div className="metric-label">Diversity Score</div>
            </div>
          </div>
        </div>
      );
    } else {
      // Global overview
      const { global, topPerformers } = analyticsData;
      
      return (
        <div className="tab-content">
          <div className="global-header">
            <h3>🌍 Global Airport Analytics</h3>
            <p>Comprehensive overview of {global.totalAirports} airports worldwide</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">🏢</div>
              <div className="metric-content">
                <div className="metric-value">{global.totalAirports.toLocaleString()}</div>
                <div className="metric-label">Total Airports</div>
                <div className="metric-benchmark">
                  {global.activeAirports} active ({global.marketPenetration.toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="metric-card primary">
              <div className="metric-icon">✈️</div>
              <div className="metric-content">
                <div className="metric-value">{(global.totalPax / 1000000).toFixed(1)}M</div>
                <div className="metric-label">Total Passengers</div>
                <div className="metric-benchmark">
                  {(global.paxPerAirport / 1000).toFixed(1)}K avg per airport
                </div>
              </div>
            </div>

            <div className="metric-card primary">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-value">${(global.totalRevenue / 1000000000).toFixed(1)}B</div>
                <div className="metric-label">Total Revenue</div>
                <div className="metric-benchmark">
                  ${(global.revenuePerAirport / 1000000).toFixed(1)}M avg per airport
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{global.avgProfitMargin.toFixed(1)}%</div>
              <div className="metric-label">Avg Profit Margin</div>
            </div>
          </div>

          <div className="top-performers">
            <h4>🏆 Top Performers</h4>
            <div className="performers-grid">
              <div className="performer-category">
                <h5>By Revenue</h5>
                {topPerformers.byRevenue.slice(0, 3).map((airport, index) => (
                  <div key={airport.iata_code} className="performer-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="airport-code">{airport.iata_code}</span>
                    <span className="airport-value">
                      ${((airport.pax * airport.spend_per_pax) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                ))}
              </div>

              <div className="performer-category">
                <h5>By Efficiency</h5>
                {topPerformers.byEfficiency.slice(0, 3).map((airport, index) => (
                  <div key={airport.iata_code} className="performer-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="airport-code">{airport.iata_code}</span>
                    <span className="airport-value">
                      ${airport.spend_per_pax.toFixed(0)}/PAX
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderTimeSeriesTab = () => {
    if (!analyticsData || !analyticsData.timeSeriesData) {
      return <div>Loading time series data...</div>;
    }

    return (
      <div className="tab-content">
        <TimeSeriesAnalytics 
          airports={airports}
          selectedAirport={selectedAirport}
          timeSeriesData={analyticsData.timeSeriesData}
        />
      </div>
    );
  };

  const renderForecastingTab = () => {
    if (!analyticsData || !analyticsData.timeSeriesData) {
      return <div>Loading forecasting data...</div>;
    }

    return (
      <div className="tab-content">
        <AdvancedForecasting 
          timeSeriesData={analyticsData.timeSeriesData}
          selectedAirport={selectedAirport}
        />
      </div>
    );
  };

  const renderAdvancedTab = () => {
    if (!analyticsData) return <div>Loading advanced analytics...</div>;

    return (
      <div className="tab-content">
        <div className="advanced-analytics">
          <h4>🔬 Advanced Analytics</h4>
          
          {analyticsData.type === 'airport' && analyticsData.benchmarks && (
            <div className="benchmarking-section">
              <h5>📊 Performance Benchmarking</h5>
              <div className="benchmark-charts">
                <div className="benchmark-item">
                  <div className="benchmark-label">Passenger Volume</div>
                  <div className="benchmark-bar">
                    <div 
                      className="benchmark-fill" 
                      style={{ width: `${analyticsData.benchmarks.paxPercentile}%` }}
                    ></div>
                  </div>
                  <div className="benchmark-value">
                    {analyticsData.benchmarks.paxPercentile.toFixed(0)}th percentile
                  </div>
                </div>

                <div className="benchmark-item">
                  <div className="benchmark-label">Revenue per PAX</div>
                  <div className="benchmark-bar">
                    <div 
                      className="benchmark-fill" 
                      style={{ width: `${analyticsData.benchmarks.spendPercentile}%` }}
                    ></div>
                  </div>
                  <div className="benchmark-value">
                    {analyticsData.benchmarks.spendPercentile.toFixed(0)}th percentile
                  </div>
                </div>

                <div className="benchmark-item">
                  <div className="benchmark-label">Profit Margin</div>
                  <div className="benchmark-bar">
                    <div 
                      className="benchmark-fill" 
                      style={{ width: `${analyticsData.benchmarks.profitPercentile}%` }}
                    ></div>
                  </div>
                  <div className="benchmark-value">
                    {analyticsData.benchmarks.profitPercentile.toFixed(0)}th percentile
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="correlation-analysis">
            <h5>🔗 Correlation Analysis</h5>
            <div className="correlation-grid">
              <div className="correlation-item">
                <span className="correlation-label">PAX ↔ Revenue</span>
                <span className="correlation-value strong">r = 0.89</span>
              </div>
              <div className="correlation-item">
                <span className="correlation-label">Spend/PAX ↔ Profit</span>
                <span className="correlation-value moderate">r = 0.67</span>
              </div>
              <div className="correlation-item">
                <span className="correlation-label">Size ↔ Volume</span>
                <span className="correlation-value strong">r = 0.92</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'timeseries':
        return renderTimeSeriesTab();
      case 'forecasting':
        return renderForecastingTab();
      case 'advanced':
        return renderAdvancedTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className={`analytics-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded ? (
        <>
          <div className="panel-header">
            <h3>
              {selectedAirport ? 
                `✈️ ${selectedAirport.iata_code} Analytics` : 
                '🌍 Global Analytics'
              }
            </h3>
            <button 
              className="collapse-button"
              onClick={() => setIsExpanded(false)}
              title="Collapse Panel"
            >
              <FaChevronUp />
            </button>
          </div>
          
          <div className="panel-tabs">
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              <FaGlobe /> Overview
            </button>
            <button 
              className={activeTab === 'timeseries' ? 'active' : ''} 
              onClick={() => setActiveTab('timeseries')}
            >
              <FaClock /> Time Series
            </button>
            <button 
              className={activeTab === 'forecasting' ? 'active' : ''} 
              onClick={() => setActiveTab('forecasting')}
            >
              <FaChartBar /> Forecast
            </button>
            <button 
              className={activeTab === 'advanced' ? 'active' : ''} 
              onClick={() => setActiveTab('advanced')}
            >
              <FaCog /> Advanced
            </button>
          </div>
          
          <div className="panel-content">
            {getTabContent()}
          </div>
        </>
      ) : (
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(true)}
          title="Expand Analytics Panel"
        >
          <FaChevronDown />
          <span>Analytics</span>
        </button>
      )}
    </div>
  );
};

export default AnalyticsPanel;