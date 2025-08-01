import React, { useState, useMemo } from 'react';
import { FaGlobe, FaChartBar, FaTable, FaChevronDown, FaChevronUp, FaArrowLeft, FaPlane, FaUsers, FaDollarSign, FaPercent } from 'react-icons/fa';
import { CircleFlag } from 'react-circle-flags';
import './Dashboard.css';

const Dashboard = ({ data, selectedCountry, selectedCountryAirports, onBackToGlobal }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);

  // Utility function to get ISO code for flags
  const getCountryISO = (country) => {
    if (!country || !country.properties) return null;
    const iso = country.properties.ISO_A2;
    return iso ? iso.toLowerCase() : null;
  };

  const isGlobalView = !selectedCountry;
  const countryName = selectedCountry ? 
    (selectedCountry.properties.ADMIN || selectedCountry.properties.NAME) : 
    'Global View';
  const countryISO = getCountryISO(selectedCountry);

  // Calculate comprehensive analytics based on airports data
  const analytics = useMemo(() => {
    if (!selectedCountryAirports?.length) {
      // Global analytics from all airports data would go here
      // Mock top nationalities for global view
      const globalTopNationalities = [
        ['China', { pax: 5200000, airports: 49, revenue: 45000000 }],
        ['USA', { pax: 4800000, airports: 215, revenue: 42000000 }],
        ['Japan', { pax: 3500000, airports: 32, revenue: 38000000 }],
        ['Germany', { pax: 3200000, airports: 22, revenue: 35000000 }],
        ['United Kingdom', { pax: 2900000, airports: 25, revenue: 32000000 }],
        ['France', { pax: 2600000, airports: 18, revenue: 28000000 }],
        ['Turkey', { pax: 2400000, airports: 17, revenue: 26000000 }],
        ['India', { pax: 2200000, airports: 18, revenue: 24000000 }],
        ['Spain', { pax: 2000000, airports: 27, revenue: 22000000 }]
      ];

      // Mock top airports for global view
      const globalTopByPAX = [
        { iata_code: 'ATL', airport_name: 'Hartsfield-Jackson Atlanta Intl', pax: 352131 },
        { iata_code: 'DXB', airport_name: 'Dubai International', pax: 315478 },
        { iata_code: 'HND', airport_name: 'Tokyo Haneda', pax: 271215 },
        { iata_code: 'LHR', airport_name: 'London Heathrow', pax: 260432 },
        { iata_code: 'CDG', airport_name: 'Charles de Gaulle', pax: 211616 },
        { iata_code: 'DEN', airport_name: 'Denver International', pax: 189547 },
        { iata_code: 'IST', airport_name: 'Istanbul Airport', pax: 186321 },
        { iata_code: 'SIN', airport_name: 'Singapore Changi', pax: 188996 },
        { iata_code: 'FRA', airport_name: 'Frankfurt am Main', pax: 175423 }
      ];

      return {
        totalAirports: 1545,
        totalCountries: 197,
        totalPAX: 30000000,
        totalRevenue: 6860000000,
        pmiPenetration: 33.3,
        avgSpendPerPAX: 8689.20,
        avgProfitMargin: 93.7,
        topNationalities: globalTopNationalities,
        topByPAX: globalTopByPAX,
        topByRevenue: globalTopByPAX // For simplicity, using same as PAX
      };
    }

    // Country-specific analytics
    const airports = selectedCountryAirports || [];
    const totalPAX = airports.reduce((sum, airport) => sum + (airport.pax || 0), 0);
    const totalRevenue = airports.reduce((sum, airport) => sum + ((airport.pax || 0) * (airport.spend_per_pax || 0)), 0);
    const pmiAirports = airports.filter(airport => (airport.pmi_profit_pct || 0) > 0);
    const avgSpendPerPAX = totalPAX > 0 ? totalRevenue / totalPAX : 0;
    const avgProfitMargin = pmiAirports.length > 0 ? 
      pmiAirports.reduce((sum, airport) => sum + (airport.pmi_profit_pct || 0), 0) / pmiAirports.length : 0;

    // Top performers
    const topByPAX = airports
      .filter(airport => airport.pax > 0)
      .sort((a, b) => (b.pax || 0) - (a.pax || 0))
      .slice(0, 9);

    const topByRevenue = airports
      .filter(airport => (airport.pax || 0) * (airport.spend_per_pax || 0) > 0)
      .sort((a, b) => ((b.pax || 0) * (b.spend_per_pax || 0)) - ((a.pax || 0) * (a.spend_per_pax || 0)))
      .slice(0, 9);

    // Nationality analysis
    const nationalityStats = {};
    airports.forEach(airport => {
      if (airport.nationality && airport.pax > 0) {
        if (!nationalityStats[airport.nationality]) {
          nationalityStats[airport.nationality] = { pax: 0, airports: 0, revenue: 0 };
        }
        nationalityStats[airport.nationality].pax += airport.pax || 0;
        nationalityStats[airport.nationality].airports += 1;
        nationalityStats[airport.nationality].revenue += (airport.pax || 0) * (airport.spend_per_pax || 0);
      }
    });

    const topNationalities = Object.entries(nationalityStats)
      .sort((a, b) => b[1].pax - a[1].pax)
      .slice(0, 9);

    return {
      totalAirports: airports.length,
      totalPAX,
      totalRevenue,
      avgSpendPerPAX,
      avgProfitMargin,
      pmiPenetration: airports.length > 0 ? (pmiAirports.length / airports.length) * 100 : 0,
      topByPAX,
      topByRevenue,
      topNationalities,
      nationalityStats
    };
  }, [selectedCountryAirports]);

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
    <div className="overview-section">
              <h4>Global DF-MACASE Overview</h4>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><FaPlane /></div>
          <div className="kpi-content">
            <div className="kpi-value">1,545</div>
            <div className="kpi-label">Total Airports</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaGlobe /></div>
          <div className="kpi-content">
            <div className="kpi-value">197</div>
            <div className="kpi-label">Countries</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaUsers /></div>
          <div className="kpi-content">
            <div className="kpi-value">30.0M</div>
            <div className="kpi-label">Total PAX</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaDollarSign /></div>
          <div className="kpi-content">
            <div className="kpi-value">$6.86B</div>
            <div className="kpi-label">Total Revenue</div>
          </div>
          </div>
        </div>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">PMI Market Penetration</span>
          <span className="stat-value">33.3% (515 of 1,545 airports)</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Spend per PAX</span>
          <span className="stat-value">$8,689.20</span>
              </div>
        <div className="stat-item">
          <span className="stat-label">Average Profit Margin</span>
          <span className="stat-value">93.7%</span>
              </div>
        <div className="stat-item">
          <span className="stat-label">Data Quality</span>
          <span className="stat-value">100% complete for financial metrics</span>
              </div>
            </div>

      <div className="performance-indicators">
        <CircularProgress 
          percentage={33.3} 
          title="PMI Penetration"
          color="#4CAF50"
        />
        <CircularProgress 
          percentage={93.7} 
          title="Avg Profit Margin"
          color="#2196F3"
        />
      </div>
      </div>
    );

  // Country Overview Section
  const CountryOverview = () => (
    <div className="overview-section">
              <h4>{countryName} Performance</h4>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><FaPlane /></div>
          <div className="kpi-content">
            <div className="kpi-value">{analytics.totalAirports}</div>
            <div className="kpi-label">Airports</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaUsers /></div>
          <div className="kpi-content">
            <div className="kpi-value">{(analytics.totalPAX || 0).toLocaleString()}</div>
            <div className="kpi-label">Total PAX</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaDollarSign /></div>
          <div className="kpi-content">
            <div className="kpi-value">${(analytics.totalRevenue || 0).toLocaleString()}</div>
            <div className="kpi-label">Total Revenue</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FaPercent /></div>
          <div className="kpi-content">
            <div className="kpi-value">{analytics.pmiPenetration.toFixed(1)}%</div>
            <div className="kpi-label">PMI Penetration</div>
          </div>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Average Spend per PAX</span>
          <span className="stat-value">${analytics.avgSpendPerPAX.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Profit Margin</span>
          <span className="stat-value">{analytics.avgProfitMargin.toFixed(1)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">PMI-Active Airports</span>
          <span className="stat-value">{Math.round(analytics.totalAirports * analytics.pmiPenetration / 100)} of {analytics.totalAirports}</span>
        </div>
      </div>

      <div className="performance-indicators">
        <CircularProgress 
          percentage={analytics.pmiPenetration} 
          title="PMI Penetration"
          color="#4CAF50"
        />
        <CircularProgress 
          percentage={Math.min(100, analytics.avgProfitMargin)} 
          title="Avg Profit Margin"
          color="#2196F3"
        />
      </div>
    </div>
  );

  // Top Performers Section
  const TopPerformers = () => {
    const showNationalities = isGlobalView;
    const performers = showNationalities ? analytics.topNationalities : analytics.topByPAX;
    
    // Safety check to ensure performers is an array
    if (!performers || !Array.isArray(performers) || performers.length === 0) {
      return (
        <div className="top-performers">
          <h4>{showNationalities ? 'Top 9 Nationalities' : 'Top 9 Airports'}</h4>
          <div className="performers-table">
            <div className="table-header">
              <span>{showNationalities ? 'NATIONALITY' : 'AIRPORT'}</span>
              <span>PAX</span>
            </div>
            <div className="table-row">
              <span className="performer-name">No data available</span>
              <span className="performer-value">-</span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="top-performers">
        <h4>{showNationalities ? 'Top 9 Nationalities' : 'Top 9 Airports'}</h4>
        
        {showNationalities && (
          <div className="total-stats">
            <div className="total-stat">
              <span className="total-label">PAX of selected Nationalities (of all Nationalities)</span>
              <span className="total-value">4,857,149,929 (100.0%)</span>
            </div>
          </div>
        )}

        <div className="performers-table">
          <div className="table-header">
            <span>{showNationalities ? 'NATIONALITY' : 'AIRPORT'}</span>
            <span>PAX</span>
          </div>
          {performers.map((item, index) => {
            if (showNationalities) {
              const [nationality, stats] = item;
              return (
                <div key={nationality} className="table-row">
                  <span className="performer-name">{nationality}</span>
                  <span className="performer-value">{stats.pax.toLocaleString()}</span>
                </div>
              );
            } else {
              return (
                <div key={item.iata_code || index} className="table-row">
                  <span className="performer-name">{item.iata_code || item.airport_name}</span>
                  <span className="performer-value">{(item.pax || 0).toLocaleString()}</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  // Financial Overview Section
  const FinancialOverview = () => (
    <div className="financial-overview">
                <h4>Financial Overview</h4>
      
      <div className="financial-stats">
        <div className="financial-item">
          <span className="financial-label">PAX spent on PMI in sel. {isGlobalView ? 'Nationalities' : 'Airports'}</span>
          <span className="financial-value">${(analytics.totalRevenue || 0).toLocaleString()} (100.0%)</span>
        </div>
        
        {!isGlobalView && (
          <>
            <div className="financial-item">
              <span className="financial-label">Selected Airports PMI DF NOR 2023</span>
              <span className="financial-value">${(analytics.totalRevenue || 0).toLocaleString()}</span>
            </div>
            
            <div className="financial-item">
              <span className="financial-label">Total Airports PMI DF NOR 2023</span>
              <span className="financial-value">${(analytics.totalRevenue || 0).toLocaleString()}</span>
            </div>
          </>
        )}
        
        <div className="financial-item">
          <span className="financial-label">Total PAX travelled in DF 2023</span>
          <span className="financial-value">{(analytics.totalPAX || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="financial-charts">
        <div className="chart-container">
          <div className="chart-title">% PAX CC users (vs all LANU)</div>
          <CircularProgress 
            percentage={96.6} 
            title=""
            color="#4CAF50"
          />
        </div>
        
        <div className="chart-container">
          <div className="chart-title">% PMIDF CC purchases (vs all Cat.)</div>
          <CircularProgress 
            percentage={82.6} 
            title=""
            color="#2196F3"
          />
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
            <TopPerformers />
            <FinancialOverview />
          </div>
        );
      case 'details':
        return (
          <div className="tab-content">
            <div className="details-section">
              <h4>Detailed Analytics</h4>
              
              {analytics.topByRevenue?.length > 0 && (
                <div className="revenue-table">
                  <h5>Top Revenue Generators</h5>
                  <div className="table-header">
                    <span>Airport</span>
                    <span>PAX</span>
                    <span>Revenue</span>
                    <span>$/PAX</span>
                  </div>
                  {analytics.topByRevenue.slice(0, 5).map((airport, index) => (
                    <div key={airport.iata_code || index} className="table-row">
                      <span>{airport.iata_code}</span>
                      <span>{(airport.pax || 0).toLocaleString()}</span>
                      <span>${((airport.pax || 0) * (airport.spend_per_pax || 0)).toLocaleString()}</span>
                      <span>${(airport.spend_per_pax || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="tab-content">
            <div className="analytics-section">
              <h4>Advanced Analytics</h4>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h5>Market Penetration</h5>
                  <div className="analytics-stats">
                    <div className="analytics-item">
                      <span>PMI Active</span>
                      <span>{Math.round(analytics.totalAirports * analytics.pmiPenetration / 100)}</span>
                    </div>
                    <div className="analytics-item">
                      <span>Total Airports</span>
                      <span>{analytics.totalAirports}</span>
                    </div>
                    <div className="analytics-item">
                      <span>Penetration Rate</span>
                      <span>{analytics.pmiPenetration.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h5>Performance Metrics</h5>
                  <div className="analytics-stats">
                    <div className="analytics-item">
                      <span>Avg Profit Margin</span>
                      <span>{analytics.avgProfitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="analytics-item">
                      <span>Avg Spend/PAX</span>
                      <span>${analytics.avgSpendPerPAX.toLocaleString()}</span>
                    </div>
                    <div className="analytics-item">
                      <span>Total Revenue</span>
                      <span>${(analytics.totalRevenue || 0).toLocaleString()}</span>
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