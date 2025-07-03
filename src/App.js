import React, { useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import './App.css';

const World = () => {
  const [countries, setCountries] = useState({ features: []});
  const [hoverD, setHoverD] = useState();

  useEffect(() => {
    fetch('./datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        console.log('GeoJSON loaded. Features count:', data.features.length);
        setCountries(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  const getVal = (feat) => {
    const gdp = feat.properties.GDP_MD_EST;
    const pop = feat.properties.POP_EST;

    if (!gdp || !pop || gdp <= 0 || pop <= 0) {
      return 0;
    }

    const gdpPerCapita = gdp / Math.max(1e5, pop);
    return gdpPerCapita;
  };

  const colorScale = scaleSequentialSqrt(interpolateYlOrRd);

  const maxVal = useMemo(() => {
    if (!countries.features || countries.features.length === 0) return 1;

    const validValues = countries.features
      .map(getVal)
      .filter(val => val > 0 && !isNaN(val));

    if (validValues.length === 0) return 1;

    const max = Math.max(...validValues);
    console.log('Max GDP per capita:', max);

    return max;
  }, [countries]);

  colorScale.domain([0, maxVal]);

  const getCountryColor = (country) => {
    if (country === hoverD) {
      return 'steelblue';
    }

    const gdpPerCapita = getVal(country);
    if (gdpPerCapita <= 0) {
      return '#666666'; // Gray for missing data
    }

    const color = colorScale(gdpPerCapita);
    return color;
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
        const gdpMdEst = d.GDP_MD_EST;
        const gdp = gdpMdEst;

        return (
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div><b>{d.ADMIN || d.NAME} ({d.ISO_A2}):</b></div>
            <div>GDP: <i>{gdp || 'N/A'}</i> M$</div>
            <div>Population: <i>{d.POP_EST || 'N/A'}</i></div>
            <div>GDP per capita: <i>{gdp && d.POP_EST ? (gdp / Math.max(1e5, d.POP_EST)).toFixed(2) : 'N/A'}</i></div>
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