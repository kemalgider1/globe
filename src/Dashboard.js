import React, { useState } from 'react';
import { FaGlobe, FaChartBar, FaTable, FaChevronDown, FaChevronUp, FaArrowLeft } from 'react-icons/fa';
import { CircleFlag } from 'react-circle-flags';
import './Dashboard.css';

const Dashboard = ({ data, selectedCountry, onBackToGlobal }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);

  // Utility function to get ISO code for flags
  const getCountryISO = (country) => {
    if (!country || !country.properties) return null;
    const iso = country.properties.ISO_A2;
    return iso ? iso.toLowerCase() : null;
  };

  // Always show the dashboard - it will show global or country-specific content
  const isGlobalView = !selectedCountry;
  const countryName = selectedCountry ? 
    (selectedCountry.properties.ADMIN || selectedCountry.properties.NAME) : 
    'Global View';
  const countryISO = getCountryISO(selectedCountry);

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

  // Global Overview Section
  const GlobalOverview = () => (
    <div className="global-overview">
      <h4>Global Performance Overview</h4>
      <div className="overview-metrics">
        <div className="overview-metric">
          <span className="metric-label">Total Countries</span>
          <span className="metric-value">{data?.countriesWithData || 0}</span>
        </div>
        <div className="overview-metric">
          <span className="metric-label">Global 2024 Volume</span>
          <span className="metric-value">{(data?.total2024 || 0).toLocaleString()}</span>
        </div>
        <div className="overview-metric">
          <span className="metric-label">Global 2023 Volume</span>
          <span className="metric-value">{(data?.total2023 || 0).toLocaleString()}</span>
        </div>
        <div className="overview-metric">
          <span className="metric-label">Average PMI %</span>
          <span className="metric-value">{(data?.avgPmi || 0).toFixed(1)}%</span>
        </div>
      </div>
      <div className="progress-charts">
        <CircularProgress 
          percentage={data?.avgPmi || 0} 
          title="Global PMI Average"
          color="#4CAF50"
        />
        <CircularProgress 
          percentage={
            (data?.aboveAvg && data?.belowAvg) 
              ? ((data.aboveAvg / (data.aboveAvg + data.belowAvg)) * 100) 
              : 0
          } 
          title="Countries Above Average"
          color="#2196F3"
        />
      </div>
    </div>
  );

  // Country-Specific Overview Section
  const CountryOverview = () => {
    const volume2024 = Number(selectedCountry?.properties?.volume_2024) || 0;
    const volume2023 = Number(selectedCountry?.properties?.volume_2023) || 0;
    const pmiPercentage = selectedCountry?.properties?.pmi_percentage || 0;
    const growth = volume2023 > 0 ? ((volume2024 - volume2023) / volume2023) * 100 : 0;

    return (
      <div className="country-overview">
        <h4>{countryName} Performance</h4>
        <div className="overview-metrics">
          <div className="overview-metric">
                <span className="metric-label">2024 Volume</span>
            <span className="metric-value">{volume2024.toLocaleString()}</span>
              </div>
          <div className="overview-metric">
            <span className="metric-label">2023 Volume</span>
            <span className="metric-value">{volume2023.toLocaleString()}</span>
          </div>
          <div className="overview-metric">
            <span className="metric-label">PMI Performance</span>
            <span className="metric-value">{pmiPercentage.toFixed(1)}%</span>
          </div>
          <div className="overview-metric">
            <span className="metric-label">Growth Rate</span>
            <span className="metric-value">{growth.toFixed(1)}%</span>
          </div>
        </div>
        <div className="progress-charts">
          <CircularProgress 
            percentage={pmiPercentage} 
            title="PMI Performance"
            color="#4CAF50"
          />
          <CircularProgress 
            percentage={Math.max(0, Math.min(100, growth + 50))} 
            title="Growth Index"
            color="#2196F3"
          />
            </div>
      </div>
    );
  };

  // Top Countries Table
  const TopCountriesTable = () => (
    <div className="top-countries-table">
      <h4>Top 5 Countries by Volume</h4>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Country</th>
            <th>Volume 2024</th>
            <th>PMI %</th>
          </tr>
        </thead>
        <tbody>
          {(data?.top5 || []).map((country, index) => (
            <tr key={country?.name || index}>
              <td>{index + 1}</td>
              <td>{country?.name || 'Unknown'}</td>
              <td>{(country?.volume || 0).toLocaleString()}</td>
              <td>{(country?.pmi || 0).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Market Analysis Section
  const MarketAnalysis = () => (
    <div className="market-analysis">
      <div className="analysis-grid">
        <div className="analysis-card">
          <h5>Market Distribution</h5>
          <div className="analysis-stats">
            <div className="analysis-item">
              <span className="analysis-label">Above Average PMI</span>
              <span className="analysis-value">{data?.aboveAvg || 0} countries</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Below Average PMI</span>
              <span className="analysis-value">{data?.belowAvg || 0} countries</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Total Coverage</span>
              <span className="analysis-value">{data?.countriesWithData || 0} countries</span>
            </div>
          </div>
        </div>
        
        <div className="analysis-card">
          <h5>Volume Insights</h5>
          <div className="analysis-stats">
            <div className="analysis-item">
              <span className="analysis-label">2024 Total Volume</span>
              <span className="analysis-value">{(data?.total2024 || 0).toLocaleString()}</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">2023 Total Volume</span>
              <span className="analysis-value">{(data?.total2023 || 0).toLocaleString()}</span>
        </div>
                           <div className="analysis-item">
                 <span className="analysis-label">Year-over-Year Growth</span>
                 <span className="analysis-value">
                   {(data?.total2023 && data?.total2024) ? 
                     (((data.total2024 - data.total2023) / data.total2023) * 100).toFixed(1) + '%' : 
                     '0.0%'
                   }
                 </span>
        </div>
        </div>
        </div>
      </div>
    </div>
  );

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {isGlobalView ? <GlobalOverview /> : <CountryOverview />}
            {isGlobalView && <TopCountriesTable />}
          </div>
        );
      case 'details':
        return (
          <div className="tab-content">
            <div className="details-section">
              <h4>{isGlobalView ? 'Global' : countryName} Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">View Type</span>
                  <span className="detail-value">{isGlobalView ? 'Global Analysis' : 'Country Analysis'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Data Points</span>
                  <span className="detail-value">{data?.countriesWithData || 0}</span>
                </div>
                                 <div className="detail-item">
                   <span className="detail-label">PMI Coverage</span>
                   <span className="detail-value">{((data?.aboveAvg || 0) + (data?.belowAvg || 0))} countries</span>
        </div>
                <div className="detail-item">
                  <span className="detail-label">Volume Range</span>
                  <span className="detail-value">2023-2024</span>
        </div>
        </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="tab-content">
            <MarketAnalysis />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`dashboard ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded ? (
        <>
          <div className="panel-header">
            <h3>
              {isGlobalView ? (
                <FaGlobe />
              ) : countryISO ? (
                <CircleFlag countryCode={countryISO} height="24" />
              ) : (
                <FaGlobe />
              )}
              {isGlobalView ? 'Global Dashboard' : `${countryName} Dashboard`}
            </h3>
            <div className="panel-controls">
              {!isGlobalView && (
                <button 
                  className="back-button"
                  onClick={onBackToGlobal}
                  title="Back to Global View"
                >
                  <FaArrowLeft />
                </button>
              )}
              <button 
                className="collapse-button"
                onClick={() => setIsExpanded(false)}
                title="Collapse Panel"
              >
                <FaChevronUp />
              </button>
            </div>
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
            {isGlobalView ? (
              <span>Global</span>
            ) : countryISO ? (
              <CircleFlag countryCode={countryISO} height="32" />
            ) : (
              <span>{countryName.substring(0, 8)}</span>
            )}
            <FaChevronDown />
          </div>
        </div>
    )}
    </div>
  );
};

export default Dashboard; 