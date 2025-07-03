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

        // Detailed logging to see what properties are available
        const firstCountry = data.features[0];
        console.log('First country full object:', firstCountry);
        console.log('First country properties:', firstCountry.properties);
        console.log('All property keys:', Object.keys(firstCountry.properties));

        // Check specific properties we need
        console.log('GDP_MD_EST:', firstCountry.properties.GDP_MD_EST);
        console.log('POP_EST:', firstCountry.properties.POP_EST);
        console.log('GDP_MD:', firstCountry.properties.GDP_MD);
        console.log('NAME:', firstCountry.properties.NAME);
        console.log('ADMIN:', firstCountry.properties.ADMIN);

        // Check multiple countries to see data patterns
        data.features.slice(0, 5).forEach((country, index) => {
          console.log(`Country ${index + 1}:`, {
            name: country.properties.NAME || country.properties.ADMIN,
            gdp_md_est: country.properties.GDP_MD_EST,
            gdp_md: country.properties.GDP_MD,
            pop_est: country.properties.POP_EST,
            gdp_year: country.properties.GDP_YEAR,
            economy: country.properties.ECONOMY
          });
        });

        setCountries(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  const getVal = (feat) => {
    const gdpMdEst = feat.properties.GDP_MD_EST;
    const gdpMd = feat.properties.GDP_MD;
    const popEst = feat.properties.POP_EST;

    // Try different GDP property names
    const gdp = gdpMdEst || gdpMd;

    // Handle missing or invalid data
    if (!gdp || !popEst || gdp <= 0 || popEst <= 0) {
      return 0;
    }

    const gdpPerCapita = gdp / Math.max(1e5, popEst);
    return gdpPerCapita;
  };

  const colorScale = scaleSequentialSqrt(interpolateYlOrRd);

  const maxVal = useMemo(() => {
    if (!countries.features || countries.features.length === 0) return 1;

    const validValues = countries.features
      .map(getVal)
      .filter(val => val > 0 && !isNaN(val));

    console.log('Valid GDP values found:', validValues.length, 'out of', countries.features.length);

    if (validValues.length === 0) {
      console.log('No valid GDP data found - using fallback');
      return 1;
    }

    const max = Math.max(...validValues);
    console.log('Max GDP per capita:', max);
    console.log('Sample values:', validValues.slice(0, 10));

    return max;
  }, [countries]);

  colorScale.domain([0, maxVal]);

  const getCountryColor = (country) => {
    if (country === hoverD) {
      console.log(`Hover color applied to: ${country.properties.NAME || country.properties.ADMIN}`);
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

  console.log('Rendering globe with', filteredCountries.length, 'countries');

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
        const gdpMd = d.GDP_MD;
        const gdp = gdpMdEst || gdpMd;

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