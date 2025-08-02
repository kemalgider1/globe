import React, { useState, useMemo } from 'react';
import { FaGlobe, FaChartBar, FaTable, FaChevronDown, FaChevronUp, FaPlane, FaUsers, FaDollarSign, FaPercent, FaTrophy } from 'react-icons/fa';
import { CircleFlag } from 'react-circle-flags';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { useNCPTData } from './ncptDataProcessor';
import './AnalyticsPanel.css';
import './NCPTStyles.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const AnalyticsPanelEnhanced = ({ airports, selectedAirport }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Load NCPT data
  const { ncptData, loading: ncptLoading, error: ncptError } = useNCPTData();

  // Utility function to get ISO code for flags from airport country data
  const getCountryISO = (airport) => {
    if (!airport || !airport.country) return null;
    
    // Comprehensive country name to ISO code mapping
    const countryISOMap = {
      'United States': 'us', 'USA': 'us', 'Canada': 'ca', 'United Kingdom': 'gb', 'UK': 'gb',
      'Germany': 'de', 'France': 'fr', 'Italy': 'it', 'Spain': 'es', 'Netherlands': 'nl',
      'Belgium': 'be', 'Switzerland': 'ch', 'Austria': 'at', 'Denmark': 'dk', 'Sweden': 'se',
      'Norway': 'no', 'Finland': 'fi', 'Russia': 'ru', 'China': 'cn', 'Japan': 'jp',
      'South Korea': 'kr', 'Korea': 'kr', 'India': 'in', 'Australia': 'au', 'Brazil': 'br',
      'Turkey': 'tr', 'Greece': 'gr', 'Portugal': 'pt', 'Ireland': 'ie', 'Poland': 'pl'
    };
    
    const exactMatch = countryISOMap[airport.country];
    if (exactMatch) return exactMatch;
    
    const countryLower = airport.country.toLowerCase();
    for (const [key, value] of Object.entries(countryISOMap)) {
      if (key.toLowerCase().includes(countryLower) || countryLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null;
  };

  // Get NCPT data for selected airport
  const airportNCPTData = useMemo(() => {
    if (!ncptData || !selectedAirport) return null;
    
    const airportData = ncptData.airports[selectedAirport.airport_name];
    return airportData || null;
  }, [ncptData, selectedAirport]);

  // Memoized valid airports for better performance
  const validAirports = useMemo(() => {
    return airports.filter(a => 
      a.pax > 0 && 
      a.pmi_profit_pct !== undefined && 
      a.pmi_profit_pct !== null &&
      a.spend_per_pax !== undefined &&
      a.spend_per_pax !== null
    );
  }, [airports]);

  // Enhanced business insights calculations
  const businessInsights = useMemo(() => {
    if (!selectedAirport) return null;

    try {
      const airport = selectedAirport;
      
      if (!airport.iata_code || !airport.airport_name) {
        return null;
      }

      if (validAirports.length === 0) {
        return null;
      }

      const globalPAXRank = validAirports
        .sort((a, b) => (b.pax || 0) - (a.pax || 0))
        .findIndex(a => a.iata_code === airport.iata_code) + 1;

      const globalRevenueRank = validAirports
        .sort((a, b) => ((b.pax || 0) * (b.spend_per_pax || 0)) - ((a.pax || 0) * (a.spend_per_pax || 0)))
        .findIndex(a => a.iata_code === airport.iata_code) + 1;

      const paxPercentile = ((validAirports.length - globalPAXRank + 1) / validAirports.length * 100);
      const revenuePercentile = ((validAirports.length - globalRevenueRank + 1) / validAirports.length * 100);
      
      let performanceCategory = 'Standard';
      if (airport.pax > 100000 && airport.spend_per_pax > 1000) {
        performanceCategory = 'Star Performer';
      } else if (airport.pax > 100000) {
        performanceCategory = 'Volume Leader';
      } else if (airport.spend_per_pax > 1000) {
        performanceCategory = 'Niche Premium';
      } else if (airport.pax > 50000) {
        performanceCategory = 'Regional Hub';
      }

      const opportunityScore = (() => {
        let score = 0;
        if (airport.pmi_profit_pct < 85) score += 30;
        if (airport.pax > 50000) score += 25;
        if (airport.prevalence_pct < 80) score += 20;
        if (airport.spend_per_pax < 500) score += 25;
        return Math.min(score, 100);
      })();

      return {
        performanceCategory,
        paxPercentile: paxPercentile.toFixed(1),
        revenuePercentile: revenuePercentile.toFixed(1),
        opportunityScore,
        marketMaturity: airport.prevalence_pct > 90 ? 'Saturated' : 
                       airport.prevalence_pct > 70 ? 'Mature' : 
                       airport.prevalence_pct > 40 ? 'Developing' : 'Emerging'
      };
    } catch (error) {
      console.error('AnalyticsPanel: Error calculating business insights', error);
      return null;
    }
  }, [selectedAirport, validAirports]);

  // Calculate airport-specific analytics data
  const analyticsData = useMemo(() => {
    if (!selectedAirport) {
      return null;
    }

    try {
      const airport = selectedAirport;
      
      if (!airport.iata_code || !airport.airport_name) {
        console.warn('AnalyticsPanel: Selected airport missing required fields', airport);
        return null;
      }

      if (validAirports.length === 0) {
        console.warn('AnalyticsPanel: No valid airports for comparison');
        return null;
      }

      const airportPax = airport.pax || 0;
      const airportSpendPerPax = airport.spend_per_pax || 0;
      const airportSpending = airportPax * airportSpendPerPax;
      const airportNationality = airport.nationality || 'Unknown';
      
      const airportPMIPercent = airport.pmi_profit_pct || 0;
      const airportCCPercent = ((airport.cot_cc_pct || 0.85) * 100);
      
      const globalPAXRank = validAirports
        .sort((a, b) => (b.pax || 0) - (a.pax || 0))
        .findIndex(a => a.iata_code === airport.iata_code) + 1;

      const globalRevenueRank = validAirports
        .sort((a, b) => ((b.pax || 0) * (b.spend_per_pax || 0)) - ((a.pax || 0) * (a.spend_per_pax || 0)))
        .findIndex(a => a.iata_code === airport.iata_code) + 1;

      return {
        airport,
        airportPax,
        airportSpending,
        airportNationality,
        airportPMIPercent,
        airportCCPercent,
        allValidAirports: validAirports,
        globalPAXRank,
        globalRevenueRank,
        isDataValid: true
      };
    } catch (error) {
      console.error('AnalyticsPanel: Error calculating analytics data', error);
      return {
        isDataValid: false,
        error: error.message
      };
    }
  }, [selectedAirport, validAirports]);

  // Only show panel if an airport is selected
  if (!selectedAirport || !analyticsData) {
    return null;
  }

  // Handle data validation errors
  if (analyticsData && !analyticsData.isDataValid) {
    return (
      <div className="analytics-panel expanded">
        <div className="panel-header">
          <h3>
            <FaPlane />
            Analytics Error
          </h3>
        </div>
        <div className="panel-content">
          <div className="error-state">
            <div className="error-message">
              <h4>Unable to Load Analytics</h4>
              <p>There was an issue processing the airport data:</p>
              <code>{analyticsData.error || 'Unknown error occurred'}</code>
              <p>Please try selecting a different airport or refresh the page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Circular progress chart component
  const CircularProgress = ({ percentage, title, color = '#00ffe7' }) => (
    <div className="circular-progress">
      <div className="progress-circle">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 32}`}
            strokeDashoffset={`${2 * Math.PI * 32 * (1 - percentage / 100)}`}
            transform="rotate(-90 40 40)"
            className="progress-arc"
          />
        </svg>
        <div className="progress-text">
          <span className="progress-percentage">{percentage.toFixed(1)}%</span>
        </div>
      </div>
      <div className="progress-title">{title}</div>
    </div>
  );

  // Get color for category
  const getCategoryColor = (categoryKey) => {
    const colors = {
      'P1': '#4CAF50',
      'P4_Disposable': '#2196F3', 
      'P4_Closed': '#FF9800',
      'P5': '#9C27B0'
    };
    return colors[categoryKey] || '#00ffe7';
  };

  // Professional Heatmap Matrix Component
  const CategoryMetricsHeatmap = ({ categories }) => {
    const metrics = ['awareness', 'trial', 'p7d', 'growth'];
    const categoryKeys = Object.keys(categories);
    
    // Create color scale
    const colorScale = scaleSequential(interpolateViridis).domain([0, 1]);
    
    return (
      <div className="metrics-heatmap">
        <div className="heatmap-header">
          <div className="heatmap-corner"></div>
          {metrics.map(metric => (
            <div key={metric} className="heatmap-metric-label">
              {metric.toUpperCase()}
            </div>
          ))}
        </div>
        {categoryKeys.map(categoryKey => (
          <div key={categoryKey} className="heatmap-row">
            <div className="heatmap-category-label">
              {categoryKey.replace('_', ' ')}
            </div>
            {metrics.map(metric => {
              const value = parseFloat(categories[categoryKey][metric] || 0);
              const color = colorScale(value);
              return (
                <div 
                  key={metric}
                  className="heatmap-cell"
                  style={{ backgroundColor: color }}
                  title={`${categoryKey} ${metric}: ${(value * 100).toFixed(1)}%`}
                >
                  <span className="heatmap-value">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Radar Chart for Category Comparison
  const CategoryRadarChart = ({ categories }) => {
    const categoryKeys = Object.keys(categories);
    const datasets = categoryKeys.map((categoryKey, index) => {
      const metrics = categories[categoryKey];
      return {
        label: categoryKey.replace('_', ' '),
        data: [
          parseFloat(metrics.awareness || 0) * 100,
          parseFloat(metrics.trial || 0) * 100,
          parseFloat(metrics.p7d || 0) * 100,
          parseFloat(metrics.growth || 0) * 100
        ],
        backgroundColor: `${getCategoryColor(categoryKey)}20`,
        borderColor: getCategoryColor(categoryKey),
        borderWidth: 2,
        pointBackgroundColor: getCategoryColor(categoryKey),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: getCategoryColor(categoryKey),
      };
    });

    const data = {
      labels: ['Awareness', 'Trial', 'P7D', 'Growth'],
      datasets
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            font: { size: 10 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          pointLabels: {
            color: '#fff',
            font: { size: 10 }
          }
        }
      }
    };

    return (
      <div className="radar-chart-container">
        <Radar data={data} options={options} />
      </div>
    );
  };

  // Compact Funnel Progress Component
  const CompactFunnelBars = ({ categories }) => {
    return (
      <div className="compact-funnel-container">
        {Object.entries(categories).map(([categoryKey, metrics]) => {
          const conversionRate = parseFloat(metrics.conversionRate) || 0;
          return (
            <div key={categoryKey} className="funnel-bar-item">
              <div className="funnel-bar-header">
                <span className="funnel-category-name">{categoryKey.replace('_', ' ')}</span>
                <span className="funnel-conversion-rate">{conversionRate}%</span>
              </div>
              <div className="funnel-progress-container">
                <div className="funnel-stage-bar">
                  <div className="funnel-stage-label">A</div>
                  <div className="funnel-progress-track">
                    <div 
                      className="funnel-progress-fill awareness"
                      style={{ width: `${(parseFloat(metrics.awareness) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="funnel-value">{(parseFloat(metrics.awareness) * 100).toFixed(0)}%</span>
                </div>
                <div className="funnel-stage-bar">
                  <div className="funnel-stage-label">T</div>
                  <div className="funnel-progress-track">
                    <div 
                      className="funnel-progress-fill trial"
                      style={{ width: `${(parseFloat(metrics.trial) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="funnel-value">{(parseFloat(metrics.trial) * 100).toFixed(0)}%</span>
                </div>
                <div className="funnel-stage-bar">
                  <div className="funnel-stage-label">P</div>
                  <div className="funnel-progress-track">
                    <div 
                      className="funnel-progress-fill p7d"
                      style={{ width: `${(parseFloat(metrics.p7d) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="funnel-value">{(parseFloat(metrics.p7d) * 100).toFixed(0)}%</span>
                </div>
                <div className="funnel-stage-bar">
                  <div className="funnel-stage-label">G</div>
                  <div className="funnel-progress-track">
                    <div 
                      className="funnel-progress-fill growth"
                      style={{ width: `${(parseFloat(metrics.growth) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="funnel-value">{(parseFloat(metrics.growth) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Airport Category Performance Overview
  const AirportCategoryOverview = () => {
    if (ncptLoading) {
      return (
        <div className="overview-section">
          <h4>🔄 Loading Category Funnel Data...</h4>
        </div>
      );
    }

    if (ncptError || !airportNCPTData) {
      return (
        <div className="overview-section">
          <h4>Airport Category Performance</h4>
          <div className="ncpt-error">
            <h4>No NCPT Data Available</h4>
            <p>Category funnel data not found for this airport.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overview-section">
        <h4>Airport Category Performance - {analyticsData.airport.airport_name}</h4>
        
        <div className="summary-stats" style={{ marginBottom: '16px' }}>
          <div className="stat-item">
            <span className="stat-label">Airport Total PAX (NCPT)</span>
            <span className="stat-value">{airportNCPTData.totalPAX}M</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nationality Coverage</span>
            <span className="stat-value">{airportNCPTData.nationalityBreakdown?.length || 0} nationalities</span>
          </div>
        </div>

        {/* Professional Category Visualizations */}
        {airportNCPTData.aggregatedCategories && (
          <div className="professional-viz-container">
            
            {/* Compact Heatmap Matrix */}
            <div className="viz-section">
              <h6>Metrics Heatmap</h6>
              <CategoryMetricsHeatmap categories={airportNCPTData.aggregatedCategories} />
            </div>

            {/* Radar Chart Comparison */}
            <div className="viz-section">
              <h6>Category Radar</h6>
              <CategoryRadarChart categories={airportNCPTData.aggregatedCategories} />
            </div>

            {/* Compact Funnel Bars */}
            <div className="viz-section">
              <h6>Funnel Progress</h6>
              <CompactFunnelBars categories={airportNCPTData.aggregatedCategories} />
            </div>

          </div>
        )}
      </div>
    );
  };

  // Nationality Breakdown (separate section)
  const NationalityBreakdown = () => {
    if (!airportNCPTData?.nationalityBreakdown) return null;

    return (
      <div className="overview-section">
        <h4>Top 10 Nationalities Breakdown</h4>

        {/* Nationality Breakdown with Category Data */}
        <div className="nationality-breakdown-container">
          {airportNCPTData.nationalityBreakdown?.slice(0, 5).map((nationality, index) => (
            <div key={nationality.nationality} className="nationality-breakdown-card">
              <div className="nationality-breakdown-header">
                <div className="nationality-info">
                  <span className="nationality-rank">#{index + 1}</span>
                  <span className="nationality-name">{nationality.nationality}</span>
                </div>
                <div className="nationality-metrics">
                  <div className="nationality-metric">
                    <span className="nationality-metric-label">PAX</span>
                    <span className="nationality-metric-value">{nationality.pax}M</span>
                  </div>
                  <div className="nationality-metric">
                    <span className="nationality-metric-label">Share</span>
                    <span className="nationality-metric-value">{nationality.share}%</span>
                  </div>
                </div>
              </div>

              {/* Category Performance for this Nationality */}
              <div className="category-comparison-grid">
                {Object.entries(nationality.categories).map(([categoryKey, metrics]) => {
                  if (!metrics.awareness) return null;
                  
                  const categoryName = categoryKey.replace('_', ' ');
                  const conversionRate = metrics.trial && metrics.awareness 
                    ? ((metrics.trial / metrics.awareness) * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={categoryKey} className="category-comparison-item">
                      <div className="comparison-category-name">{categoryName}</div>
                      <div className="comparison-metric">{conversionRate}%</div>
                      <div className="comparison-label">Conversion</div>
                    </div>
                  );
                })}
              </div>

              {/* Funnel Visualization for Top Category */}
              {nationality.categories.P1?.awareness && (
                <div className="funnel-visualization">
                  <div className="funnel-stage">
                    <span className="funnel-stage-name">Awareness</span>
                    <div className="funnel-stage-bar">
                      <div 
                        className="funnel-stage-progress" 
                        style={{ width: `${(nationality.categories.P1.awareness * 100).toFixed(1)}%` }}
                      ></div>
                    </div>
                    <span className="funnel-stage-value">{(nationality.categories.P1.awareness * 100).toFixed(1)}%</span>
                  </div>
                  <div className="funnel-stage">
                    <span className="funnel-stage-name">Trial</span>
                    <div className="funnel-stage-bar">
                      <div 
                        className="funnel-stage-progress" 
                        style={{ width: `${((nationality.categories.P1.trial || 0) * 100).toFixed(1)}%` }}
                      ></div>
                    </div>
                    <span className="funnel-stage-value">{((nationality.categories.P1.trial || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Airport Overview Section
  const AirportOverview = () => (
    <div className="overview-section">
      <h4>{analyticsData.airport.airport_name} ({analyticsData.airport.iata_code})</h4>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><FaUsers /></div>
          <div className="kpi-content">
            <div className="kpi-value">{analyticsData.airportPax.toLocaleString()}</div>
            <div className="kpi-label">Total PAX</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaDollarSign /></div>
          <div className="kpi-content">
            <div className="kpi-value">${analyticsData.airportSpending.toLocaleString()}</div>
            <div className="kpi-label">Total Revenue</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaPercent /></div>
          <div className="kpi-content">
            <div className="kpi-value">{analyticsData.airportPMIPercent.toFixed(1)}%</div>
            <div className="kpi-label">PMI Profit</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaTrophy /></div>
          <div className="kpi-content">
            <div className="kpi-value">#{analyticsData.globalPAXRank}</div>
            <div className="kpi-label">Global Rank</div>
          </div>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Spend per PAX</span>
          <span className="stat-value">${analyticsData.airport.spend_per_pax.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Size Category</span>
          <span className="stat-value">{analyticsData.airport.size_category} airport</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Data Quality</span>
          <span className="stat-value">{(analyticsData.airport.data_completeness_score * 100).toFixed(0)}% complete</span>
        </div>
      </div>

      <div className="performance-indicators">
        <CircularProgress 
          percentage={analyticsData.airportPMIPercent} 
          title="PMI Performance"
          color="#4CAF50"
        />
        <CircularProgress 
          percentage={analyticsData.airportCCPercent} 
          title="CC Usage Rate"
          color="#2196F3"
        />
      </div>
    </div>
  );

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <AirportOverview />
            <AirportCategoryOverview />
            <NationalityBreakdown />
          </div>
        );
      case 'details':
        return (
          <div className="tab-content">
            <div className="details-section">
              <h4>{analyticsData.airport.airport_name} Details</h4>
              
              <div className="revenue-table">
                <h5>Airport Metrics</h5>
                <div className="table-header">
                  <span>Metric</span>
                  <span>Value</span>
                  <span>Rank</span>
                  <span>Percentile</span>
                </div>
                <div className="table-row">
                  <span>PAX Volume</span>
                  <span>{Math.round(analyticsData.airport.pax).toLocaleString()}</span>
                  <span>#{analyticsData.globalPAXRank}</span>
                  <span>{((1 - analyticsData.globalPAXRank / analyticsData.allValidAirports.length) * 100).toFixed(0)}th</span>
                </div>
                <div className="table-row">
                  <span>Total Revenue</span>
                  <span>${analyticsData.airportSpending.toLocaleString()}</span>
                  <span>#{analyticsData.globalRevenueRank}</span>
                  <span>{((1 - analyticsData.globalRevenueRank / analyticsData.allValidAirports.length) * 100).toFixed(0)}th</span>
                </div>
                <div className="table-row">
                  <span>Spend per PAX</span>
                  <span>${analyticsData.airport.spend_per_pax.toFixed(2)}</span>
                  <span>-</span>
                  <span>-</span>
                </div>
                <div className="table-row">
                  <span>PMI Profit %</span>
                  <span>{analyticsData.airport.pmi_profit_pct.toFixed(2)}%</span>
                  <span>-</span>
                  <span>-</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="tab-content">
            <div className="analytics-section">
              <h4>Advanced Analytics</h4>
              
              <div className="analytics-grid">
                <div className="analytics-card highlight-card">
                  <h5>Performance Classification</h5>
                  <div className="analytics-stats">
                    <div className="analytics-item">
                      <span>Category</span>
                      <span className="performance-badge">{businessInsights?.performanceCategory || 'Standard'}</span>
                    </div>
                    <div className="analytics-item">
                      <span>Market Maturity</span>
                      <span>{businessInsights?.marketMaturity || 'Unknown'}</span>
                    </div>
                    <div className="analytics-item">
                      <span>Opportunity Score</span>
                      <span className={`opportunity-score ${businessInsights?.opportunityScore > 70 ? 'high' : businessInsights?.opportunityScore > 40 ? 'medium' : 'low'}`}>
                        {businessInsights?.opportunityScore || 0}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`analytics-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded ? (
        <>
          <div className="panel-header">
            <h3>
              {getCountryISO(analyticsData.airport) ? (
                <CircleFlag countryCode={getCountryISO(analyticsData.airport)} height="24" />
              ) : (
                <FaPlane />
              )}
              {analyticsData.airport.airport_name}
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
              className={activeTab === 'details' ? 'active' : ''} 
              onClick={() => setActiveTab('details')}
            >
              <FaTable /> Details
            </button>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''} 
              onClick={() => setActiveTab('analytics')}
            >
              <FaChartBar /> Analytics
            </button>
          </div>
          
          <div className="panel-content">
            {renderTabContent()}
          </div>
        </>
      ) : (
        <div className="collapsed-panel" onClick={() => setIsExpanded(true)}>
          <div className="collapsed-content">
            <FaChevronDown />
            <span>NCPT</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanelEnhanced;