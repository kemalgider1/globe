import React, { useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { scaleThreshold } from 'd3-scale';
import Dashboard from './Dashboard';
import AnalyticsPanel from './AnalyticsPanel';
import './App.css';

const World = () => {
  const [countries, setCountries] = useState({ features: []});
  const [airports, setAirports] = useState([]);
  const [hoverD, setHoverD] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);

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

  // Load airports from airports_points.json
  useEffect(() => {
    const loadAirports = async () => {
      try {
        const response = await fetch('./datasets/airports_points.json');
        const airportData = await response.json();
        console.log(`✈️ LOADED ${airportData.length} airports`);
        setAirports(airportData);
      } catch (error) {
        console.error('Error loading airports:', error);
        setAirports([]);
      }
    };
    loadAirports();
  }, []);

  // Function to create a circular polygon for an airport
  const createAirportPolygon = (lat, lng, radiusKm = 10.0) => { // Larger size for better visibility
    const points = 12; // More points for smoother circle
    const coordinates = [];
    
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const latOffset = (radiusKm / 111) * Math.cos(angle);
      const lngOffset = (radiusKm / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
      coordinates.push([lng + lngOffset, lat + latOffset]);
    }
    
    return {
      type: "Feature",
      properties: {
        type: "airport"
      },
      geometry: {
        type: "Polygon",
        coordinates: [coordinates]
      }
    };
  };

  // Filter airports for selected country and convert to polygons
  const selectedCountryAirports = useMemo(() => {
    if (!selectedCountry || !airports.length) return [];
    
    const countryName = selectedCountry.properties.ADMIN || selectedCountry.properties.NAME;
    const countryISO = selectedCountry.properties.ISO_A2;
    
    const matchedAirports = airports.filter(airport => {
      // Direct name match
      if (airport.country === countryName) return true;
      
      // ISO code match
      if (airport.nationality === countryISO) return true;
      
      // Special mappings for common country name differences
      const specialMappings = {
        'Egypt': ['Egypt', 'EG', 'EGY'],
        'United States of America': ['USA', 'United States', 'US', 'America'],
        'United Kingdom': ['UK', 'Britain', 'Great Britain', 'England', 'Scotland', 'Wales'],
        'Russian Federation': ['Russia'],
        'Republic of Korea': ['South Korea', 'Korea'],
        'Turkey': ['Türkiye'],
        'Czech Republic': ['Czechia'],
        'United Arab Emirates': ['UAE'],
        'China': ['China', 'People\'s Republic of China'],
        'Iran': ['Iran (Islamic Republic of)', 'Islamic Republic of Iran']
      };
      
      // Check special mappings
      const variants = specialMappings[countryName];
      if (variants && variants.some(variant => 
        airport.country?.toLowerCase().includes(variant.toLowerCase()) ||
        airport.nationality === variant
      )) {
        return true;
      }
      
      // Fallback: partial matching for complex names
      if (airport.country && countryName) {
        const airportCountry = airport.country.toLowerCase();
        const targetCountry = countryName.toLowerCase();
        
        if (airportCountry.includes(targetCountry.split(' ')[0]) || 
            targetCountry.includes(airportCountry.split(' ')[0])) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`Found ${matchedAirports.length} airports for ${countryName}`);
    
    // Convert airports to circular polygons
    const airportPolygons = matchedAirports.map((airport, index) => {
      // Debug coordinates for first few airports
      if (index < 2) {
        console.log(`Airport ${airport.iata_code}: lat=${airport.lat}, lng=${airport.lng}, country=${airport.country}`);
      }
      
      const polygon = createAirportPolygon(airport.lat, airport.lng);
      
      // Store airport data in properties
      polygon.properties = {
        ...polygon.properties,
        ...airport,
        airport_data: airport,
        parent_country: selectedCountry // Store reference to parent country
      };
      return polygon;
    });
    
    // Debug: Log first airport coordinates for verification
    if (airportPolygons.length > 0) {
      const firstAirport = matchedAirports[0];
      console.log(`First airport: ${firstAirport.iata_code} at lat=${firstAirport.lat}, lng=${firstAirport.lng}`);
    }
    
    return airportPolygons;
  }, [selectedCountry, airports]);

  // Combine countries and airport polygons for rendering
  const allPolygons = useMemo(() => {
    const countryPolygons = countries.features?.filter(d => d.properties.ISO_A2 !== 'AQ') || [];
    
    // Add airport polygons to the list
    return [...countryPolygons, ...selectedCountryAirports];
  }, [countries.features, selectedCountryAirports]);

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

  // Polygon styling for both countries and airports
  const getPolygonColor = (polygon) => {
    // Airport polygons - CYAN TOPS (always cyan, no conflicts)
    if (polygon.properties.type === 'airport') {
      return '#00ffe7'; // Cyan for all airports
    }
    
    // Country polygons - hover state (including when airport is hovered)
    if (polygon === hoverD) {
      return 'steelblue'; // Hover state for countries
    }
    
    // Selected country keeps its PMI color, no cyan conflict
    const pmiPercentage = getVal(polygon);
    if (pmiPercentage <= 0) {
      return '#666666';
    }
    return colorScale(pmiPercentage);
  };

  // Polygon altitude for both countries and airports
  const getPolygonAltitude = (polygon) => {
    // Airport polygons - move with their parent country
    if (polygon.properties.type === 'airport') {
      // Check if the parent country is being hovered (grouped hover)
      const parentCountry = polygon.properties.parent_country;
      const isParentCountryHovered = parentCountry === hoverD;
      
      return isParentCountryHovered ? 0.125 : 0.065; // Closer to country layer
    }
    
    // Country polygons - elevated when hovered (including when airport is hovered)
    return polygon === hoverD ? 0.12 : 0.06;
  };

  // Polygon side color - TRANSPARENT FOR AIRPORTS
  const getPolygonSideColor = (polygon) => {
    // Airport polygons - TRANSPARENT SIDES
    if (polygon.properties.type === 'airport') {
      return 'rgba(0, 0, 0, 0.0)'; // Fully transparent for airports
    }
    
    // Country polygons - keep original transparent
    return 'rgba(0, 0, 0, 0.0)';
  };

  // Event handlers
  const handlePolygonClick = (polygon) => {
    if (polygon.properties.type === 'airport') {
      // Airports are only clickable when a country is selected
      if (selectedCountry) {
        const airportData = polygon.properties.airport_data;
        setSelectedAirport(airportData);
        console.log('Airport selected:', airportData?.iata_code, airportData?.airport_name);
      }
    } else {
      // Countries are only clickable when not already selected
      if (polygon !== selectedCountry) {
        setSelectedCountry(polygon);
        setSelectedAirport(null); // Clear airport selection when country changes
        console.log('Selected country:', polygon.properties.ADMIN || polygon.properties.NAME);
      }
    }
  };

  const handleBackToGlobal = () => {
    setSelectedCountry(null);
    setSelectedAirport(null);
  };

  // Custom hover handler for grouped hover behavior
  const handlePolygonHover = (polygon) => {
    if (polygon && polygon.properties.type === 'airport') {
      // When hovering over an airport, set hover to its parent country
      const parentCountry = polygon.properties.parent_country;
      if (parentCountry) {
        setHoverD(parentCountry);
      }
    } else {
      // When hovering over a country or nothing, set hover normally
      setHoverD(polygon);
    }
  };

  return (
    <>
      <Globe
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}

        // ALL POLYGONS: Countries and airports rendered as cone polygons
        polygonsData={allPolygons}
        polygonAltitude={getPolygonAltitude}
        polygonCapColor={getPolygonColor}
        polygonSideColor={getPolygonSideColor} // Transparent sides for airports
        polygonStrokeColor={() => '#111'}
        polygonLabel={(polygon) => {
          const { properties: d } = polygon;
          
          // Airport label
          if (d.type === 'airport') {
            const airport = d.airport_data || d;
            return (
              <div style={{
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #00ffe7'
              }}>
                <div style={{fontWeight: 'bold', color: '#00ffe7', marginBottom: '4px'}}>
                  {airport.iata_code || airport.airport_code || 'Airport'}
                </div>
                <div>{airport.airport_name || 'Unknown Airport'}</div>
                {airport.pax && <div>✈️ {airport.pax.toLocaleString()} PAX</div>}
                {airport.pmi_profit_pct > 0 && (
                  <div>💰 PMI: {airport.pmi_profit_pct.toFixed(1)}%</div>
                )}
              </div>
            );
          }
          
          // Country label
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
              {selectedCountry === polygon && airportCount > 0 && (
                <div style={{marginTop: '4px', fontSize: '10px', color: '#00ffe7'}}>
                  ✈️ {airportCount} airports shown
                </div>
              )}
            </div>
          );
        }}
        onPolygonHover={handlePolygonHover}
        onPolygonClick={handlePolygonClick}
        polygonsTransitionDuration={300}
      />
      
      <AnalyticsPanel
        airports={airports}
        selectedAirport={selectedAirport}
      />
      
      <Dashboard
        data={globalData}
        selectedCountry={selectedCountry}
        selectedCountryAirports={selectedCountryAirports.map(p => p.properties.airport_data)}
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