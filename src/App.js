import React, { useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { scaleThreshold } from 'd3-scale';
import './App.css';

const World = () => {
  const [countries, setCountries] = useState({ features: []});
  const [hoverD, setHoverD] = useState();

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

  // Get the value for coloring: PMI percentage
  const getVal = (feat) => {
    const pmiPercentage = feat.properties.pmi_percentage;
    if (pmiPercentage === undefined || isNaN(pmiPercentage)) return 0;
    return pmiPercentage;
  };

  // Calculate average PMI percentage and create color scale
  const { colorScale, avgPmi } = useMemo(() => {
    if (!countries.features || countries.features.length === 0) {
      return { colorScale: () => '#666666', avgPmi: 0 };
    }

    const validValues = countries.features
      .map(getVal)
      .filter(val => val > 0 && !isNaN(val));

    if (validValues.length === 0) {
      return { colorScale: () => '#666666', avgPmi: 0 };
    }

    const avgPmi = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    
    // Create thresholds every 7% around the average
    const thresholds = [];
    const range = 35; // ±35% from average (5 steps of 7%)
    
    for (let i = -range; i <= range; i += 7) {
      thresholds.push(avgPmi + i);
    }
    
    // Create color scale with red-yellow-green
    const colors = [
      '#d73027', // dark red
      '#f46d43', // red-orange
      '#fdae61', // orange
      '#fee08b', // yellow
      '#d9ef8b', // light green
      '#a6d96a', // green
      '#66bd63', // dark green
      '#1a9850'  // very dark green
    ];
    
    const colorScale = scaleThreshold()
      .domain(thresholds)
      .range(colors);

    return { colorScale, avgPmi };
  }, [countries]);

  const getCountryColor = (country) => {
    if (country === hoverD) {
      return 'steelblue';
    }
    
    const pmiPercentage = getVal(country);
    if (pmiPercentage <= 0) {
      return '#666666'; // Gray for missing data
    }
    
    return colorScale(pmiPercentage);
  };

  const filteredCountries = countries.features.filter(d => d.properties.ISO_A2 !== 'AQ');

  return (
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
      polygonsTransitionDuration={300}
    />
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