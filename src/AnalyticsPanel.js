import React, { useState, useMemo } from 'react';
import { FaGlobe, FaChartBar, FaTable, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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

  // Calculate airport-specific analytics data
  const analyticsData = useMemo(() => {
    // Only calculate if an airport is selected
    if (!selectedAirport) {
      return null;
    }
    const airport = selectedAirport;
    const allValidAirports = airports.filter(a => a.pax > 0 && a.pmi_profit_pct > 0);
    
    // Airport-specific metrics
    const airportPax = airport.pax;
    const airportSpending = airport.pax * airport.spend_per_pax;
    const airportNationality = airport.nationality || 'Unknown';
    
    // Nationality analysis - find top performing nationalities and this airport's ranking
    const nationalityStats = allValidAirports.reduce((acc, ap) => {
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
      acc[nationality].pax += ap.pax;
      acc[nationality].spending += ap.pax * ap.spend_per_pax;
      acc[nationality].airports += 1;
      acc[nationality].totalPMI += ap.pmi_profit_pct;
      acc[nationality].avgPMI = acc[nationality].totalPMI / acc[nationality].airports;
      return acc;
    }, {});

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

    // Airport performance metrics
    const airportPMIPercent = airport.pmi_profit_pct;
    const airportCCPercent = (airport.cot_cc_pct || 0) * 100;
    
    // Comparative analysis
    const sameNationalityAirports = allValidAirports.filter(a => a.nationality === airportNationality);
    const nationalityAvgPMI = sameNationalityAirports.reduce((sum, a) => sum + a.pmi_profit_pct, 0) / sameNationalityAirports.length;
    const nationalityRank = sameNationalityAirports
      .sort((a, b) => b.pmi_profit_pct - a.pmi_profit_pct)
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
      allValidAirports
    };
  }, [selectedAirport, airports]);

  // Only show panel if an airport is selected
  if (!selectedAirport || !analyticsData) {
    return null;
  }

  // Circular progress chart component
  const CircularProgress = ({ percentage, title, color = '#00ffe7' }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="circular-progress">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="progress-ring__circle-bg"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="transparent"
            r="45"
            cx="60"
            cy="60"
          />
          <circle
            className="progress-ring__circle"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            fill="transparent"
            r="45"
            cx="60"
            cy="60"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference * 0.25}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="60" className="progress-text" textAnchor="middle" dominantBaseline="middle">
            {percentage.toFixed(1)}%
          </text>
        </svg>
        <div className="progress-title">{title}</div>
      </div>
    );
  };

  // Top nationalities table - focused on selected airport's context
  const TopNationalitiesTable = () => (
    <div className="top-nationalities-table">
      <h4>Top 9 Nationalities</h4>
      <div className="airport-nationality-highlight">
        <span className="selected-airport">
          {getCountryISO(analyticsData.airport) ? (
            <CircleFlag countryCode={getCountryISO(analyticsData.airport)} height="20" />
          ) : (
            <span>Selected:</span>
          )}
          {analyticsData.airport.airport_name} ({analyticsData.airportNationality})
        </span>
        <span className="nationality-rank">
          Rank #{analyticsData.nationalityRank} of {analyticsData.totalNationalityAirports} {analyticsData.airportNationality} airports
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Nationality</th>
            <th>PAX</th>
            <th>Avg PMI %</th>
          </tr>
        </thead>
        <tbody>
          {analyticsData.topNationalities.map((nationality) => (
            <tr key={nationality.nationality} className={nationality.isSelected ? 'selected-row' : ''}>
              <td>{nationality.rank}</td>
              <td>{nationality.nationality}</td>
              <td>{nationality.pax.toLocaleString()}</td>
              <td>{nationality.avgPMI}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Airport-specific financial overview
  const FinancialOverview = () => (
    <div className="financial-overview">
      <h4>Financial Overview - {analyticsData.airport.airport_name}</h4>
      <div className="financial-metrics">
        <div className="financial-metric">
          <span className="metric-label">Total PAX at this Airport</span>
          <span className="metric-value">{analyticsData.airportPax.toLocaleString()}</span>
        </div>
        <div className="financial-metric">
          <span className="metric-label">Total Spending at this Airport</span>
          <span className="metric-value">${analyticsData.airportSpending.toLocaleString()}</span>
        </div>
        <div className="financial-metric">
          <span className="metric-label">Spend per PAX</span>
          <span className="metric-value">${analyticsData.airport.spend_per_pax.toFixed(2)}</span>
        </div>
        <div className="financial-metric">
          <span className="metric-label">Nationality Average PMI</span>
          <span className="metric-value">{analyticsData.nationalityAvgPMI.toFixed(1)}%</span>
        </div>
      </div>
      <div className="progress-charts">
        <CircularProgress 
          percentage={analyticsData.airportPMIPercent} 
          title="PMI Performance (%)"
          color="#4CAF50"
        />
        <CircularProgress 
          percentage={analyticsData.airportCCPercent} 
          title="CC Usage Rate (%)"
          color="#2196F3"
        />
      </div>
    </div>
  );

  // Advanced Analytics Component
  const AdvancedAnalytics = () => {
    const airport = analyticsData.airport;
    const sameCountryAirports = analyticsData.allValidAirports.filter(a => a.country === airport.country);
    
    return (
      <div className="advanced-analytics">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h5>Performance Benchmarking</h5>
            <div className="benchmark-stats">
              <div className="benchmark-item">
                <span className="benchmark-label">vs Global Average</span>
                <span className="benchmark-value">
                  {airport.pmi_profit_pct > 85 ? '+' : ''}{(airport.pmi_profit_pct - 85).toFixed(1)}%
                </span>
              </div>
              <div className="benchmark-item">
                <span className="benchmark-label">vs Nationality Average</span>
                <span className="benchmark-value">
                  {airport.pmi_profit_pct > analyticsData.nationalityAvgPMI ? '+' : ''}{(airport.pmi_profit_pct - analyticsData.nationalityAvgPMI).toFixed(1)}%
                </span>
              </div>
              <div className="benchmark-item">
                <span className="benchmark-label">Country Rank</span>
                <span className="benchmark-value">
                  #{sameCountryAirports.sort((a, b) => b.pmi_profit_pct - a.pmi_profit_pct).findIndex(a => a.iata_code === airport.iata_code) + 1} of {sameCountryAirports.length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="analytics-card">
            <h5>Market Position Analysis</h5>
            <div className="position-stats">
              <div className="position-item">
                <span className="position-label">Size Category</span>
                <span className="position-value">{airport.size_category}</span>
              </div>
              <div className="position-item">
                <span className="position-label">Data Completeness</span>
                <span className="position-value">{(airport.data_completeness_score * 100).toFixed(0)}%</span>
              </div>
              <div className="position-item">
                <span className="position-label">PMI SoB %</span>
                <span className="position-value">{(airport.pmi_sob_pct * 100).toFixed(1)}%</span>
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
            <TopNationalitiesTable />
            <FinancialOverview />
          </div>
        );
      case 'details':
        return (
          <div className="tab-content">
            <div className="airport-details">
              <h4><FaTable /> {analyticsData.airport.airport_name} Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">IATA Code</span>
                  <span className="detail-value">{analyticsData.airport.iata_code}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Country</span>
                  <span className="detail-value">{analyticsData.airport.country}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nationality</span>
                  <span className="detail-value">{analyticsData.airport.nationality}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GTR Location</span>
                  <span className="detail-value">{analyticsData.airport.df_location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PAX Volume</span>
                  <span className="detail-value">{Math.round(analyticsData.airport.pax).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Spend per PAX</span>
                  <span className="detail-value">${analyticsData.airport.spend_per_pax.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PMI Profit %</span>
                  <span className="detail-value">{analyticsData.airport.pmi_profit_pct.toFixed(2)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Prevalence %</span>
                  <span className="detail-value">{analyticsData.airport.prevalence_pct.toFixed(2)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">COT CC %</span>
                  <span className="detail-value">{(analyticsData.airport.cot_cc_pct * 100).toFixed(1)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">National CT %</span>
                  <span className="detail-value">{(analyticsData.airport.nat_ct_pct * 100).toFixed(1)}%</span>
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
            <h3>GTR-MACASE Analytics</h3>
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