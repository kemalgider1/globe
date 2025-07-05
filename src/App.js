import React, { useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { scaleThreshold } from 'd3-scale';
import Dashboard from './Dashboard';
import './App.css';

const World = () => {
  const [countries, setCountries] = useState({ features: []});
  const [airports, setAirports] = useState([]);
  const [hoverD, setHoverD] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Load countries data
  useEffect(() => {
    fetch('./datasets/ne_110m_admin_0_countries_with_sales.geojson')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  // Load airport data
  useEffect(() => {
    const loadAirportData = async () => {
      try {
        const response = await fetch('./datasets/airports_points.json');
        const airportData = await response.json();

        // Filter out airports with invalid coordinates
        const validAirports = airportData.filter(airport => {
          const lat = parseFloat(airport.lat);
          const lng = parseFloat(airport.lng);
          return !isNaN(lat) && !isNaN(lng) &&
                 lat >= -90 && lat <= 90 &&
                 lng >= -180 && lng <= 180;
        });

        console.log(`Loaded ${validAirports.length} valid airports out of ${airportData.length} total`);
        setAirports(validAirports);
      } catch (error) {
        console.error('Error loading airport data:', error);
        setAirports([]);
      }
    };
    loadAirportData();
  }, []);

  // Get airports for selected country (for dashboard and display)
  const selectedCountryAirports = useMemo(() => {
    if (!selectedCountry || !airports.length) return [];

    const countryName = selectedCountry.properties.ADMIN || selectedCountry.properties.NAME;
    const countryISO = selectedCountry.properties.ISO_A2;

    return airports.filter(airport => {
      return airport.country === countryName ||
             airport.nationality === countryISO ||
             (airport.country && countryName &&
              airport.country.toLowerCase().includes(countryName.toLowerCase())) ||
             (countryName === 'United States of America' &&
              ['USA', 'United States', 'US'].some(variant =>
                airport.country?.includes(variant))) ||
             (countryName === 'United Kingdom' &&
              ['UK', 'Britain', 'Great Britain'].some(variant =>
                airport.country?.includes(variant))) ||
             (countryName === 'Turkey' &&
              ['Türkiye', 'Turkey'].some(variant =>
                airport.country?.includes(variant))) ||
             (countryName === 'Russia' &&
              ['Russian Fed.', 'Russia', 'Russian Federation'].some(variant =>
                airport.country?.includes(variant))) ||
             (countryName === 'China' &&
              ['China', 'People\'s Republic of China'].some(variant =>
                airport.country?.includes(variant)));
    });
  }, [selectedCountry, airports]);

  // Get the value for coloring: PMI percentage
  const getVal = (feat) => {
    const pmiPercentage = feat.properties.pmi_percentage;
    if (pmiPercentage === undefined || isNaN(pmiPercentage)) return 0;
    return pmiPercentage;
  };

  // Calculate average PMI percentage and create color scale
  const { colorScale, globalData } = useMemo(() => {
    if (!countries.features || countries.features.length === 0) {
      return { colorScale: () => '#666666', globalData: {} };
    }

    const validValues = countries.features
      .map(getVal)
      .filter(val => val > 0 && !isNaN(val));

    if (validValues.length === 0) {
      return { colorScale: () => '#666666', globalData: {} };
    }

    const avgPmi = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    const total2024 = countries.features.reduce((sum, f) => sum + (Number(f.properties.volume_2024) || 0), 0);
    const total2023 = countries.features.reduce((sum, f) => sum + (Number(f.properties.volume_2023) || 0), 0);
    const countriesWithData = validValues.length;
    const top5 = countries.features
      .map(f => ({
        name: f.properties.ADMIN || f.properties.NAME,
        volume: Number(f.properties.volume_2024) || 0
      }))
      .filter(c => c.volume > 0)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
    const aboveAvg = countries.features.filter(f => getVal(f) > avgPmi).length;
    const belowAvg = countries.features.filter(f => getVal(f) > 0 && getVal(f) <= avgPmi).length;

    // Create thresholds every 7% around the average
    const thresholds = [];
    const range = 35;
    for (let i = -range; i <= range; i += 7) {
      thresholds.push(avgPmi + i);
    }
    const colors = [
      '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'
    ];
    const colorScale = scaleThreshold().domain(thresholds).range(colors);

    return {
      colorScale,
      globalData: {
        total2024,
        total2023,
        avgPmi,
        countriesWithData,
        top5,
        aboveAvg,
        belowAvg
      }
    };
  }, [countries]);

  const getCountryColor = (country) => {
    if (country === hoverD) {
      return 'steelblue';
    }
    if (country === selectedCountry) {
      return '#00ffe7'; // Highlight selected country
    }
    const pmiPercentage = getVal(country);
    if (pmiPercentage <= 0) {
      return '#666666';
    }
    return colorScale(pmiPercentage);
  };

  // Event handlers
  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    console.log('Selected country:', country.properties.ADMIN || country.properties.NAME);
  };

  const handleBackToGlobal = () => {
    setSelectedCountry(null);
  };

  const filteredCountries = countries.features?.filter(d => d.properties.ISO_A2 !== 'AQ') || [];

  return (
    <>
      <Globe
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}

        // Countries
        polygonsData={filteredCountries}
        polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
        polygonCapColor={getCountryColor}
        polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
        polygonStrokeColor={() => '#111'}
        polygonLabel={({ properties: d }) => {
          const airportCount = selectedCountryAirports.length;
          return (
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div><b>{d.ADMIN || d.NAME} ({d.ISO_A2}):</b></div>
              <div>2024 Volume: <i>{Number(d.volume_2024).toLocaleString(undefined, {maximumFractionDigits: 2})}</i></div>
              <div>2023 Volume: <i>{Number(d.volume_2023).toLocaleString(undefined, {maximumFractionDigits: 2})}</i></div>
              <div>PMI %: <i>{d.pmi_percentage ? d.pmi_percentage.toFixed(2) : '0.00'}%</i></div>
              {selectedCountry === null && <div style={{marginTop: '4px', fontSize: '10px', color: '#ccc'}}>Click to see airports</div>}
              {airportCount > 0 && <div style={{marginTop: '4px', fontSize: '10px', color: '#00ffe7'}}>✈️ {airportCount} airports</div>}
            </div>
          );
        }}
        onPolygonHover={setHoverD}
        onPolygonClick={handleCountryClick}
        polygonsTransitionDuration={300}

        // Airports as points (only show for selected country)
        pointsData={selectedCountry ? selectedCountryAirports : []}
        pointAltitude={0.01}
        pointRadius={d => d.size || 0.5}
        pointColor={d => d.color || '#ff6b6b'}
        pointLabel={d => `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
            <div><b>${d.airport_name} (${d.iata_code})</b></div>
            <div>Country: ${d.country}</div>
            <div>Passengers: ${d.pax ? d.pax.toLocaleString() : 'N/A'}</div>
            <div>PMI Profit %: ${d.pmi_profit_pct ? d.pmi_profit_pct.toFixed(2) : '0.00'}%</div>
            <div>Spend per Pax: $${d.spend_per_pax ? d.spend_per_pax.toFixed(2) : '0.00'}</div>
          </div>
        `}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
      />

      <Dashboard
        data={globalData}
        selectedCountry={selectedCountry}
        selectedCountryAirports={selectedCountryAirports}
        onBackToGlobal={handleBackToGlobal}
      />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <World />
    </div>
  );
}

export default App;

