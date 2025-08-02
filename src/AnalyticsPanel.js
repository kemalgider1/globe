import React, { useState, useMemo } from 'react';
import { FaGlobe, FaChartBar, FaTable, FaChevronDown, FaChevronUp, FaPlane, FaUsers, FaDollarSign, FaPercent, FaTrophy } from 'react-icons/fa';
import { CircleFlag } from 'react-circle-flags';
import './AnalyticsPanel.css';

const AnalyticsPanel = ({ airports, selectedAirport }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);

  // Utility function to get ISO code for flags from airport country data
  const getCountryISO = (airport) => {
    if (!airport || !airport.country) return null;
    
    // Comprehensive country name to ISO code mapping
    const countryISOMap = {
      // Major Countries
      'United States': 'us',
      'United States of America': 'us',
      'USA': 'us',
      'Canada': 'ca',
      'United Kingdom': 'gb',
      'UK': 'gb',
      'Britain': 'gb',
      'England': 'gb',
      'Germany': 'de',
      'France': 'fr',
      'Italy': 'it',
      'Spain': 'es',
      'Netherlands': 'nl',
      'Belgium': 'be',
      'Switzerland': 'ch',
      'Austria': 'at',
      'Denmark': 'dk',
      'Sweden': 'se',
      'Norway': 'no',
      'Finland': 'fi',
      'Russia': 'ru',
      'Russian Federation': 'ru',
      'China': 'cn',
      'Japan': 'jp',
      'South Korea': 'kr',
      'Republic of Korea': 'kr',
      'Korea': 'kr',
      'India': 'in',
      'Australia': 'au',
      'New Zealand': 'nz',
      'Brazil': 'br',
      'Argentina': 'ar',
      'Chile': 'cl',
      'Mexico': 'mx',
      'Turkey': 'tr',
      'Türkiye': 'tr',
      'Greece': 'gr',
      'Portugal': 'pt',
      'Ireland': 'ie',
      'Czech Republic': 'cz',
      'Czechia': 'cz',
      'Poland': 'pl',
      'Hungary': 'hu',
      'Slovakia': 'sk',
      'Slovenia': 'si',
      'Croatia': 'hr',
      'Serbia': 'rs',
      'Bulgaria': 'bg',
      'Romania': 'ro',
      'Estonia': 'ee',
      'Latvia': 'lv',
      'Lithuania': 'lt',
      'Ukraine': 'ua',
      'Belarus': 'by',
      'Moldova': 'md',
      'Albania': 'al',
      'Bosnia and Herzegovina': 'ba',
      'Montenegro': 'me',
      'North Macedonia': 'mk',
      'Kosovo': 'xk',
      'Iceland': 'is',
      'Malta': 'mt',
      'Cyprus': 'cy',
      'Luxembourg': 'lu',
      'Liechtenstein': 'li',
      'Monaco': 'mc',
      'San Marino': 'sm',
      'Vatican City': 'va',
      'Andorra': 'ad',
      // Middle East & Africa
      'Egypt': 'eg',
      'Saudi Arabia': 'sa',
      'United Arab Emirates': 'ae',
      'UAE': 'ae',
      'Israel': 'il',
      'Iran': 'ir',
      'Iran (Islamic Republic of)': 'ir',
      'Iraq': 'iq',
      'Jordan': 'jo',
      'Kuwait': 'kw',
      'Lebanon': 'lb',
      'Qatar': 'qa',
      'Bahrain': 'bh',
      'Oman': 'om',
      'Yemen': 'ye',
      'South Africa': 'za',
      'Nigeria': 'ng',
      'Kenya': 'ke',
      'Ethiopia': 'et',
      'Morocco': 'ma',
      'Algeria': 'dz',
      'Tunisia': 'tn',
      'Libya': 'ly',
      'Ghana': 'gh',
      'Senegal': 'sn',
      'Ivory Coast': 'ci',
      'Cameroon': 'cm',
      'Uganda': 'ug',
      'Tanzania': 'tz',
      'Zimbabwe': 'zw',
      'Botswana': 'bw',
      'Namibia': 'na',
      'Zambia': 'zm',
      'Malawi': 'mw',
      'Mozambique': 'mz',
      'Madagascar': 'mg',
      'Mauritius': 'mu',
      'Seychelles': 'sc',
      // Asia-Pacific
      'Thailand': 'th',
      'Singapore': 'sg',
      'Malaysia': 'my',
      'Indonesia': 'id',
      'Philippines': 'ph',
      'Vietnam': 'vn',
      'Cambodia': 'kh',
      'Laos': 'la',
      'Myanmar': 'mm',
      'Bangladesh': 'bd',
      'Sri Lanka': 'lk',
      'Nepal': 'np',
      'Bhutan': 'bt',
      'Maldives': 'mv',
      'Pakistan': 'pk',
      'Afghanistan': 'af',
      'Kazakhstan': 'kz',
      'Uzbekistan': 'uz',
      'Kyrgyzstan': 'kg',
      'Tajikistan': 'tj',
      'Turkmenistan': 'tm',
      'Mongolia': 'mn',
      'North Korea': 'kp',
      'Taiwan': 'tw',
      'Hong Kong': 'hk',
      'Macau': 'mo',
      // Americas
      'Colombia': 'co',
      'Peru': 'pe',
      'Venezuela': 've',
      'Ecuador': 'ec',
      'Bolivia': 'bo',
      'Paraguay': 'py',
      'Uruguay': 'uy',
      'Guyana': 'gy',
      'Suriname': 'sr',
      'French Guiana': 'gf',
      'Cuba': 'cu',
      'Jamaica': 'jm',
      'Haiti': 'ht',
      'Dominican Republic': 'do',
      'Puerto Rico': 'pr',
      'Trinidad and Tobago': 'tt',
      'Barbados': 'bb',
      'Bahamas': 'bs',
      'Belize': 'bz',
      'Costa Rica': 'cr',
      'Panama': 'pa',
      'Nicaragua': 'ni',
      'Honduras': 'hn',
      'El Salvador': 'sv',
      'Guatemala': 'gt'
    };
    
    // First try exact match
    const exactMatch = countryISOMap[airport.country];
    if (exactMatch) return exactMatch;
    
    // If no exact match, try partial matching
    const countryLower = airport.country.toLowerCase();
    for (const [key, value] of Object.entries(countryISOMap)) {
      if (key.toLowerCase().includes(countryLower) || countryLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null;
  };

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

  // Memoized nationality statistics for performance
  const nationalityStats = useMemo(() => {
    return validAirports.reduce((acc, ap) => {
      const nationality = ap.nationality || 'Unknown';
      if (!acc[nationality]) {
        acc[nationality] = { 
          pax: 0, 
          spending: 0, 
          airports: 0, 
          avgPMI: 0,
          totalPMI: 0
        };
      }
      acc[nationality].pax += ap.pax || 0;
      acc[nationality].spending += (ap.pax || 0) * (ap.spend_per_pax || 0);
      acc[nationality].airports += 1;
      acc[nationality].totalPMI += ap.pmi_profit_pct || 0;
      acc[nationality].avgPMI = acc[nationality].totalPMI / acc[nationality].airports;
      return acc;
    }, {});
  }, [validAirports]);

  // Enhanced business insights calculations - moved before early returns
  const businessInsights = useMemo(() => {
    if (!selectedAirport) return null;

    try {
      const airport = selectedAirport;
      
      // Validate required fields
      if (!airport.iata_code || !airport.airport_name) {
        return null;
      }

      if (validAirports.length === 0) {
        return null;
      }

      // Calculate global rankings for percentile calculations
      const globalPAXRank = validAirports
        .sort((a, b) => (b.pax || 0) - (a.pax || 0))
        .findIndex(a => a.iata_code === airport.iata_code) + 1;

      const globalRevenueRank = validAirports
        .sort((a, b) => ((b.pax || 0) * (b.spend_per_pax || 0)) - ((a.pax || 0) * (a.spend_per_pax || 0)))
        .findIndex(a => a.iata_code === airport.iata_code) + 1;

      // Calculate percentile rankings
      const paxPercentile = ((validAirports.length - globalPAXRank + 1) / validAirports.length * 100);
      const revenuePercentile = ((validAirports.length - globalRevenueRank + 1) / validAirports.length * 100);
      
      // Performance category based on PAX and spend per PAX
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

      // Market opportunity scoring
      const opportunityScore = (() => {
        let score = 0;
        if (airport.pmi_profit_pct < 85) score += 30; // Below average performance
        if (airport.pax > 50000) score += 25; // High volume
        if (airport.prevalence_pct < 80) score += 20; // Low market penetration
        if (airport.spend_per_pax < 500) score += 25; // Low spend per PAX
        return Math.min(score, 100);
      })();

      // Revenue efficiency compared to similar airports
      const similarAirports = validAirports.filter(a => 
        Math.abs(a.pax - airport.pax) / airport.pax < 0.5 // Within 50% of PAX volume
      );
      const avgSimilarSpendPerPax = similarAirports.length > 1 
        ? similarAirports.reduce((sum, a) => sum + a.spend_per_pax, 0) / similarAirports.length
        : airport.spend_per_pax;

      return {
        performanceCategory,
        paxPercentile: paxPercentile.toFixed(1),
        revenuePercentile: revenuePercentile.toFixed(1),
        opportunityScore,
        efficiencyVsSimilar: ((airport.spend_per_pax / avgSimilarSpendPerPax - 1) * 100).toFixed(1),
        similarAirportsCount: similarAirports.length,
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
    // Only calculate if an airport is selected
    if (!selectedAirport) {
      return null;
    }

    // Data validation and error handling
    try {
      const airport = selectedAirport;
      
      // Validate required fields
      if (!airport.iata_code || !airport.airport_name) {
        console.warn('AnalyticsPanel: Selected airport missing required fields', airport);
        return null;
      }

      if (validAirports.length === 0) {
        console.warn('AnalyticsPanel: No valid airports for comparison');
        return null;
      }

      // Airport-specific metrics with safe defaults
      const airportPax = airport.pax || 0;
      const airportSpendPerPax = airport.spend_per_pax || 0;
      const airportSpending = airportPax * airportSpendPerPax;
      const airportNationality = airport.nationality || 'Unknown';
      
      // Use pre-calculated nationality stats
      const topNationalities = Object.entries(nationalityStats)
        .sort((a, b) => b[1].pax - a[1].pax)
        .slice(0, 9)
        .map(([nationality, data], index) => ({
          rank: index + 1,
          nationality,
          pax: Math.round(data.pax),
          avgPMI: data.avgPMI.toFixed(1),
          airports: data.airports,
          isSelected: nationality === airportNationality
        }));

      // Airport performance metrics with safe defaults
      const airportPMIPercent = airport.pmi_profit_pct || 0;
      const airportCCPercent = ((airport.cot_cc_pct || 0.85) * 100); // Default to 85% if missing
      
      // Comparative analysis
      const sameNationalityAirports = validAirports.filter(a => a.nationality === airportNationality);
      const nationalityAvgPMI = sameNationalityAirports.length > 0 
        ? sameNationalityAirports.reduce((sum, a) => sum + (a.pmi_profit_pct || 0), 0) / sameNationalityAirports.length
        : 0;
      const nationalityRank = sameNationalityAirports.length > 0
        ? sameNationalityAirports
            .sort((a, b) => (b.pmi_profit_pct || 0) - (a.pmi_profit_pct || 0))
            .findIndex(a => a.iata_code === airport.iata_code) + 1
        : 1;

      // Global rankings
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
        topNationalities,
        airportPMIPercent,
        airportCCPercent,
        nationalityAvgPMI,
        nationalityRank,
        totalNationalityAirports: sameNationalityAirports.length,
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
  }, [selectedAirport, validAirports, nationalityStats]);

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
          <span className="stat-label">Nationality Rank</span>
          <span className="stat-value">#{analyticsData.nationalityRank} of {analyticsData.totalNationalityAirports} {analyticsData.airportNationality} airports</span>
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

  // Top nationalities table - focused on selected airport's context
  const TopNationalitiesTable = () => (
    <div className="top-performers">
      <h4>Top 9 Nationalities</h4>
      
      <div className="total-stats">
        <div className="total-stat">
          <span className="total-label">PAX of selected Nationalities (of all Nationalities)</span>
          <span className="total-value">{analyticsData.topNationalities.reduce((sum, n) => sum + n.pax, 0).toLocaleString()} (100.0%)</span>
        </div>
      </div>

      <div className="airport-nationality-highlight">
        <span className="selected-airport">
          {getCountryISO(analyticsData.airport) ? (
            <CircleFlag countryCode={getCountryISO(analyticsData.airport)} height="20" />
          ) : (
            <span>📍</span>
          )}
          Selected: {analyticsData.airport.airport_name} ({analyticsData.airportNationality})
        </span>
      </div>

      <div className="performers-table">
        <div className="table-header">
          <span>NATIONALITY</span>
          <span>PAX</span>
        </div>
        {(analyticsData.topNationalities || []).map((nationality) => (
          <div key={nationality.nationality} className={`table-row ${nationality.isSelected ? 'selected-row' : ''}`}>
            <span className="performer-name">{nationality.nationality}</span>
            <span className="performer-value">{nationality.pax.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Airport-specific financial overview
  const FinancialOverview = () => (
    <div className="financial-overview">
                <h4>Financial Overview</h4>
      
      <div className="financial-stats">
        <div className="financial-item">
          <span className="financial-label">PAX spent on PMI at {analyticsData.airport.airport_name}</span>
          <span className="financial-value">${analyticsData.airportSpending.toLocaleString()} (100.0%)</span>
        </div>
        
        <div className="financial-item">
          <span className="financial-label">PMI Share of Business</span>
          <span className="financial-value">{(analyticsData.airport.pmi_sob_pct * 100).toFixed(1)}%</span>
        </div>
        
        <div className="financial-item">
          <span className="financial-label">National % of Customer Base</span>
          <span className="financial-value">{(analyticsData.airport.nat_ct_pct * 100).toFixed(1)}%</span>
        </div>
        
        <div className="financial-item">
          <span className="financial-label">Total PAX at this airport</span>
          <span className="financial-value">{analyticsData.airportPax.toLocaleString()}</span>
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

  // Advanced Analytics Component with Enhanced Business Intelligence
  const AdvancedAnalytics = () => {
    if (!analyticsData || !analyticsData.isDataValid) {
      return (
        <div className="analytics-section">
                        <h4>Advanced Analytics</h4>
          <div className="error-state">
            <div className="error-message">
              <h4>Unable to Load Analytics</h4>
              <p>Please select a valid airport to view advanced analytics.</p>
            </div>
          </div>
        </div>
      );
    }

    const airport = analyticsData.airport;
    const sameCountryAirports = analyticsData.allValidAirports.filter(a => a.country === airport.country);
    
    return (
      <div className="analytics-section">
                      <h4>Advanced Analytics</h4>
        
        {/* Performance Overview Card */}
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
          
          <div className="analytics-card">
                          <h5>Performance Benchmarking</h5>
            <div className="analytics-stats">
              <div className="analytics-item">
                <span>vs Global Average</span>
                <span>{airport.pmi_profit_pct > 85 ? '+' : ''}{(airport.pmi_profit_pct - 85).toFixed(1)}%</span>
              </div>
              <div className="analytics-item">
                <span>vs Nationality Average</span>
                <span>{airport.pmi_profit_pct > analyticsData.nationalityAvgPMI ? '+' : ''}{(airport.pmi_profit_pct - analyticsData.nationalityAvgPMI).toFixed(1)}%</span>
              </div>
              <div className="analytics-item">
                <span>Country Rank</span>
                <span>#{sameCountryAirports.sort((a, b) => b.pmi_profit_pct - a.pmi_profit_pct).findIndex(a => a.iata_code === airport.iata_code) + 1} of {sameCountryAirports.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Market Position Analysis */}
        <div className="analytics-grid">
          <div className="analytics-card">
                          <h5>Market Position Analysis</h5>
            <div className="analytics-stats">
              <div className="analytics-item">
                <span>Global PAX Percentile</span>
                <span>{businessInsights?.paxPercentile || 0}th</span>
              </div>
              <div className="analytics-item">
                <span>Global Revenue Percentile</span>
                <span>{businessInsights?.revenuePercentile || 0}th</span>
              </div>
              <div className="analytics-item">
                <span>PMI Share of Business</span>
                <span>{(airport.pmi_sob_pct * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-card">
                          <h5>Revenue Efficiency</h5>
            <div className="analytics-stats">
              <div className="analytics-item">
                <span>vs Similar Airports</span>
                <span>{businessInsights?.efficiencyVsSimilar > 0 ? '+' : ''}{businessInsights?.efficiencyVsSimilar || 0}%</span>
              </div>
              <div className="analytics-item">
                <span>Similar Airports Count</span>
                <span>{businessInsights?.similarAirportsCount || 0}</span>
              </div>
              <div className="analytics-item">
                <span>Data Quality Score</span>
                <span>{(airport.data_completeness_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="kpi-insights">
                        <h5>Key Performance Insights</h5>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Market Penetration</span>
              <div className="insight-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${airport.prevalence_pct}%` }}
                  ></div>
                </div>
                <span>{airport.prevalence_pct.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="insight-item">
              <span className="insight-label">National Customer %</span>
              <div className="insight-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${airport.nat_ct_pct * 100}%` }}
                  ></div>
                </div>
                <span>{(airport.nat_ct_pct * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <AirportOverview />
            <TopNationalitiesTable />
            <FinancialOverview />
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
            <AdvancedAnalytics />
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
            <span>GTR MACASE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel; 