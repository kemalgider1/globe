import React, { useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { scaleThreshold } from 'd3-scale';
import Dashboard from './Dashboard';
import './App.css';

const World = () => {
  const [countries, setCountries] = useState({ features: []});
  const [hoverD, setHoverD] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [airports, setAirports] = useState([]);
  const [visibleAirports, setVisibleAirports] = useState([]);

  useEffect(() => {
    // Load countries data
    fetch('./datasets/ne_110m_admin_0_countries_with_sales.geojson')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });

    // Load airports data
    fetch('./datasets/airports_points.json')
      .then(res => res.json())
      .then(airportData => {
        setAirports(airportData);
        console.log(`Loaded ${airportData.length} airports from JSON`);
      })
      .catch(error => {
        console.error('Error loading airports JSON:', error);
      });
  }, []);

  // Get the value for coloring: PMI percentage
  const getVal = (feat) => {
    const pmiPercentage = feat.properties.pmi_percentage;
    if (pmiPercentage === undefined || isNaN(pmiPercentage)) return 0;
    return pmiPercentage;
  };

  // Calculate average PMI percentage and create color scale
  const { colorScale, avgPmi, globalData } = useMemo(() => {
    if (!countries.features || countries.features.length === 0) {
      return { colorScale: () => '#666666', avgPmi: 0, globalData: {} };
    }

    const validValues = countries.features
      .map(getVal)
      .filter(val => val > 0 && !isNaN(val));

    if (validValues.length === 0) {
      return { colorScale: () => '#666666', avgPmi: 0, globalData: {} };
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
    const range = 35; // ±35% from average (5 steps of 7%)
    for (let i = -range; i <= range; i += 7) {
      thresholds.push(avgPmi + i);
    }
    const colors = [
      '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'
    ];
    const colorScale = scaleThreshold().domain(thresholds).range(colors);

    return {
      colorScale,
      avgPmi,
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

  // Filter airports for selected country
  useEffect(() => {
    if (selectedCountry && airports.length > 0) {
      const countryName = selectedCountry.properties.ADMIN || selectedCountry.properties.NAME;
      const countryAirports = airports.filter(airport => 
        airport.country === countryName
      );
      setVisibleAirports(countryAirports);
      console.log(`Showing ${countryAirports.length} airports for ${countryName}`);
    } else {
      setVisibleAirports([]);
    }
  }, [selectedCountry, airports]);

  const getCountryColor = (country) => {
    if (country === hoverD) {
      return 'steelblue';
    }
    if (country === selectedCountry) {
      return '#00ffe7'; // Highlight selected country
    }
    const pmiPercentage = getVal(country);
    if (pmiPercentage <= 0) {
      return '#666666'; // Gray for missing data
    }
    return colorScale(pmiPercentage);
  };

  const filteredCountries = countries.features.filter(d => d.properties.ISO_A2 !== 'AQ');

  return (
    <>
      <Globe
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        polygonsData={filteredCountries}
        polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
        polygonCapColor={getCountryColor}
        polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
        polygonStrokeColor={() => '#111'}
        polygonLabel={({ properties: d }) => {
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
              <div>2024 PMI Volume: <i>{Number(d.pmi_volume_2024).toLocaleString(undefined, {maximumFractionDigits: 2})}</i></div>
              <div>PMI % of 2024: <i>{d.pmi_percentage ? d.pmi_percentage.toFixed(2) : '0.00'}%</i></div>
              <div>Avg PMI: <i>{avgPmi.toFixed(2)}%</i></div>
            </div>
          );
        }}
        onPolygonHover={setHoverD}
        onPolygonClick={setSelectedCountry}
        polygonsTransitionDuration={300}
        // Airport points layer
        pointsData={visibleAirports}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointAltitude={0.15}
        pointRadius={d => d.size}
        pointColor={d => d.color}
        pointLabel={d => `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
            <div><b>${d.airport_name} (${d.iata_code})</b></div>
            <div>Country: ${d.country}</div>
            <div>PAX: ${d.pax.toLocaleString()}</div>
            <div>PMI Spend/PAX: $${d.spend_per_pax.toFixed(2)}</div>
            <div>PMI Profit: ${d.pmi_profit_pct.toFixed(1)}%</div>
            ${d.is_hub_airport ? '<div style="color: #ffdd44;">🌐 Hub Airport</div>' : ''}
          </div>
        `}
        onPointClick={d => {
          console.log('Airport clicked:', d);
        }}
        pointsMerge={false}
      />
      <Dashboard
        data={globalData}
        selectedCountry={selectedCountry}
        onBackToGlobal={() => setSelectedCountry(null)}
        airports={visibleAirports}
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