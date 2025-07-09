import React, { useState } from 'react';
import GlobalOverviewChart from './GlobalOverviewChart';
import GlobalFinanceChart from './GlobalFinanceChart';
import GlobalAnalyticsChart from './GlobalAnalyticsChart';
import CountryOverviewChart from './CountryOverviewChart';
import CountryFinanceChart from './CountryFinanceChart';
import CountryAnalyticsChart from './CountryAnalyticsChart';
import AirportOverviewChart from './AirportOverviewChart';
import AirportFinanceChart from './AirportFinanceChart';
import AirportAnalyticsChart from './AirportAnalyticsChart';

import './AmChartsDashboard.css';

const AmChartsDashboard = ({ airports, selectedCountry, selectedAirport }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLevel, setActiveLevel] = useState('global');

  const renderChart = (level, tab) => {
    const props = { airports };
    
    if (level === 'country' && selectedCountry) {
      props.selectedCountry = selectedCountry;
    }
    
    if (level === 'airport' && selectedAirport) {
      props.selectedAirport = selectedAirport;
    }

    switch (`${level}-${tab}`) {
      case 'global-overview':
        return <GlobalOverviewChart {...props} />;
      case 'global-finance':
        return <GlobalFinanceChart {...props} />;
      case 'global-analytics':
        return <GlobalAnalyticsChart {...props} />;
      case 'country-overview':
        return <CountryOverviewChart {...props} />;
      case 'country-finance':
        return <CountryFinanceChart {...props} />;
      case 'country-analytics':
        return <CountryAnalyticsChart {...props} />;
      case 'airport-overview':
        return <AirportOverviewChart {...props} />;
      case 'airport-finance':
        return <AirportFinanceChart {...props} />;
      case 'airport-analytics':
        return <AirportAnalyticsChart {...props} />;
      default:
        return <div className="no-data">No data available</div>;
    }
  };

  return (
    <div className="amcharts-dashboard">
      <div className="dashboard-header">
        <h2>AmCharts Analytics Dashboard</h2>
        <div className="dashboard-controls">
          <div className="level-selector">
            <button 
              className={activeLevel === 'global' ? 'active' : ''}
              onClick={() => setActiveLevel('global')}
            >
              Global
            </button>
            <button 
              className={activeLevel === 'country' ? 'active' : ''}
              onClick={() => setActiveLevel('country')}
              disabled={!selectedCountry}
            >
              Country
            </button>
            <button 
              className={activeLevel === 'airport' ? 'active' : ''}
              onClick={() => setActiveLevel('airport')}
              disabled={!selectedAirport}
            >
              Airport
            </button>
          </div>
          <div className="tab-selector">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={activeTab === 'finance' ? 'active' : ''}
              onClick={() => setActiveTab('finance')}
            >
              Finance
            </button>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-container">
          {renderChart(activeLevel, activeTab)}
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-panel">
          <h3>Chart Matrix Summary</h3>
          <div className="matrix-info">
            <div className="matrix-row">
              <div className="matrix-cell">
                <strong>Global Overview:</strong> Heat Map showing airport performance across regions
              </div>
              <div className="matrix-cell">
                <strong>Global Finance:</strong> Sankey Diagram showing revenue flow across the network
              </div>
              <div className="matrix-cell">
                <strong>Global Analytics:</strong> Tree Map with drill-down analysis
              </div>
            </div>
            <div className="matrix-row">
              <div className="matrix-cell">
                <strong>Country Overview:</strong> Column chart with pie charts showing regional breakdown
              </div>
              <div className="matrix-cell">
                <strong>Country Finance:</strong> 3D Pie Chart showing revenue vs profit analysis
              </div>
              <div className="matrix-cell">
                <strong>Country Analytics:</strong> Step Line Chart showing trend analysis
              </div>
            </div>
            <div className="matrix-row">
              <div className="matrix-cell">
                <strong>Airport Overview:</strong> Pie Chart showing individual airport performance
              </div>
              <div className="matrix-cell">
                <strong>Airport Finance:</strong> Chord Diagram showing connectivity and relationships
              </div>
              <div className="matrix-cell">
                <strong>Airport Analytics:</strong> Heat Map showing detailed metrics
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmChartsDashboard; 