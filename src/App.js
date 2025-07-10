import React, { useState, useEffect, useMemo, useRef } from 'react';
import Globe from 'react-globe.gl';
import Dashboard from './Dashboard';
import AnalyticsPanel from './AnalyticsPanel';
import './App.css';

const World = () => {
  const globeRef = useRef();
  const spotlightTimeoutRef = useRef();
  const [countries, setCountries] = useState({ features: []});
  const [airports, setAirports] = useState([]);
  const [hoverD, setHoverD] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [pmiColorData, setPmiColorData] = useState(null);
  const [spotlightActive, setSpotlightActive] = useState(false); // Delayed spotlight state

  // Utility function to convert ISO country code to flag emoji
  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '🏳️';
    
    // Handle special cases and invalid codes
    const specialFlags = {
      'XK': '🇽🇰', // Kosovo
      'TW': '🇹🇼', // Taiwan
      'PS': '🇵🇸', // Palestine
      'HK': '🇭🇰', // Hong Kong
      'MO': '🇲🇴', // Macau
      'XX': '🏳️', // Unknown
      'N/A': '🏳️', // Not available
      '': '🏳️', // Empty
      'UK': '🇬🇧', // United Kingdom alternative
      'US': '🇺🇸', // United States alternative
    };
    
    const code = countryCode.toUpperCase();
    
    // Return special case if exists
    if (specialFlags[code]) {
      return specialFlags[code];
    }
    
    // Validate ISO code (must be exactly 2 letters)
    if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) {
      return '🏳️'; // Default flag for invalid codes
    }
    
    try {
      return code.replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    } catch (error) {
      console.warn('Invalid country code for flag:', code);
      return '🏳️';
    }
  };

  // Function to map globe country names to PMI data country names
  const mapCountryName = (globeCountryName) => {
    if (!globeCountryName) return null;
    
    // Direct mapping for countries with different names
    const nameMapping = {
      'United States of America': 'USA',
      'Russian Federation': 'Russian Fed.',
      'Republic of Korea': 'South Korea',
      'Democratic People\'s Republic of Korea': 'North Korea',
      'People\'s Republic of China': 'China',
      'Iran (Islamic Republic of)': 'Iran',
      'United Kingdom': 'United Kingdom',
      'Bosnia and Herzegovina': 'Bosnia-Herz.',
      'Dominican Republic': 'Dominican Rep.',
      'Equatorial Guinea': 'Equatorial Gui.',
      'French Polynesia': 'Frenc.Polynesia',
      'British Virgin Islands': 'Brit.Virgin Is.',
      'United States Virgin Islands': 'Amer.Virgin Is.',
      'Northern Mariana Islands': 'N. Mariana Is.',
      'Papua New Guinea': 'Papua Nw Guinea',
      'Saint Vincent and the Grenadines': 'St. Vincent',
      'Trinidad and Tobago': 'Trinidad,Tobago',
      'Turks and Caicos Islands': 'Turks & Caicos',
      'Saint Kitts and Nevis': 'St Kitts&Nevis',
      'Côte d\'Ivoire': 'Ivory Coast',
      'Republic of Serbia': 'Serbia',
      'North Macedonia': 'North Macedonia',
      'Czech Republic': 'Czech Republic',
      'Republic of Lithuania': 'Lithuania',
      'Republic of Latvia': 'Latvia',
      'Republic of Estonia': 'Estonia',
      'Slovak Republic': 'Slovakia',
      'Republic of Slovenia': 'Slovenia',
      'Republic of Croatia': 'Croatia',
      'Republic of Albania': 'Albania',
      'Republic of Moldova': 'Moldova',
      'Republic of Belarus': 'Belarus',
      'Ukraine': 'Ukraine',
      'Republic of Bulgaria': 'Bulgaria',
      'Romania': 'Romania',
      'Republic of Poland': 'Poland',
      'Hungary': 'Hungary',
      'Republic of Austria': 'Austria',
      'Swiss Confederation': 'Switzerland',
      'Republic of Italy': 'Italy',
      'French Republic': 'France',
      'Kingdom of Spain': 'Spain',
      'Portuguese Republic': 'Portugal',
      'Kingdom of Belgium': 'Belgium',
      'Kingdom of the Netherlands': 'Netherlands',
      'Federal Republic of Germany': 'Germany',
      'Republic of Ireland': 'Ireland',
      'Republic of Iceland': 'Iceland',
      'Kingdom of Norway': 'Norway',
      'Kingdom of Sweden': 'Sweden',
      'Republic of Finland': 'Finland',
      'Kingdom of Denmark': 'Denmark',
      'Hellenic Republic': 'Greece',
      'Republic of Turkey': 'Turkey',
      'Republic of Cyprus': 'Cyprus',
      'Republic of Malta': 'Malta',
      'Burkina Faso': 'Burkina Faso',
      'Republic of Ghana': 'Ghana',
      'Republic of Kenya': 'Kenya',
      'United Republic of Tanzania': 'Tanzania',
      'Republic of South Africa': 'South Africa',
      'Arab Republic of Egypt': 'Egypt',
      'State of Libya': 'Libya',
      'Republic of Tunisia': 'Tunisia',
      'People\'s Democratic Republic of Algeria': 'Algeria',
      'Kingdom of Morocco': 'Morocco',
      'Islamic Republic of Mauritania': 'Mauritania',
      'Republic of Mali': 'Mali',
      'Republic of Niger': 'Niger',
      'Republic of Chad': 'Chad',
      'Republic of Sudan': 'Sudan',
      'State of Eritrea': 'Eritrea',
      'Federal Democratic Republic of Ethiopia': 'Ethiopia',
      'Republic of Djibouti': 'Djibouti',
      'Somali Republic': 'Somalia',
      'Republic of Uganda': 'Uganda',
      'Republic of Rwanda': 'Rwanda',
      'Republic of Burundi': 'Burundi',
      'Central African Republic': 'Central African Republic',
      'Republic of Cameroon': 'Cameroon',
      'Republic of Equatorial Guinea': 'Equatorial Guinea',
      'Gabonese Republic': 'Gabon',
      'Republic of the Congo': 'Congo',
      'Democratic Republic of the Congo': 'Dem. Rep. Congo',
      'Republic of Angola': 'Angola',
      'Republic of Zambia': 'Zambia',
      'Republic of Zimbabwe': 'Zimbabwe',
      'Republic of Botswana': 'Botswana',
      'Republic of Namibia': 'Namibia',
      'Kingdom of Lesotho': 'Lesotho',
      'Kingdom of Swaziland': 'Swaziland',
      'Republic of Mozambique': 'Mozambique',
      'Republic of Malawi': 'Malawi',
      'Republic of Madagascar': 'Madagascar',
      'Republic of Mauritius': 'Mauritius',
      'Republic of Seychelles': 'Seychelles',
      'Union of the Comoros': 'Comoros',
      'Republic of Cape Verde': 'Cape Verde',
      'Republic of São Tomé and Príncipe': 'São Tomé and Príncipe',
      'Republic of Guinea': 'Guinea',
      'Republic of Guinea-Bissau': 'Guinea-Bissau',
      'Republic of Sierra Leone': 'Sierra Leone',
      'Republic of Liberia': 'Liberia',
      'Republic of Togo': 'Togo',
      'Republic of Benin': 'Benin',
      'Federal Republic of Nigeria': 'Nigeria',
      'Republic of Senegal': 'Senegal',
      'Islamic Republic of The Gambia': 'Gambia',
      'Republic of India': 'India',
      'People\'s Republic of Bangladesh': 'Bangladesh',
      'Islamic Republic of Pakistan': 'Pakistan',
      'Islamic Republic of Afghanistan': 'Afghanistan',
      'Republic of the Maldives': 'Maldives',
      'Democratic Socialist Republic of Sri Lanka': 'Sri Lanka',
      'Kingdom of Bhutan': 'Bhutan',
      'Federal Democratic Republic of Nepal': 'Nepal',
      'Republic of the Union of Myanmar': 'Myanmar',
      'Kingdom of Thailand': 'Thailand',
      'Lao People\'s Democratic Republic': 'Laos',
      'Kingdom of Cambodia': 'Cambodia',
      'Socialist Republic of Vietnam': 'Vietnam',
      'Republic of the Philippines': 'Philippines',
      'Malaysia': 'Malaysia',
      'Brunei Darussalam': 'Brunei',
      'Republic of Singapore': 'Singapore',
      'Republic of Indonesia': 'Indonesia',
      'Democratic Republic of Timor-Leste': 'Timor-Leste',
      'Independent State of Papua New Guinea': 'Papua New Guinea',
      'Solomon Islands': 'Solomon Islands',
      'Republic of Vanuatu': 'Vanuatu',
      'Republic of Fiji': 'Fiji',
      'Independent State of Samoa': 'Samoa',
      'Kingdom of Tonga': 'Tonga',
      'Republic of Kiribati': 'Kiribati',
      'Republic of Nauru': 'Nauru',
      'Republic of Palau': 'Palau',
      'Federated States of Micronesia': 'Micronesia',
      'Republic of the Marshall Islands': 'Marshall Islands',
      'Tuvalu': 'Tuvalu',
      'Australia': 'Australia',
      'New Zealand': 'New Zealand',
      'Japan': 'Japan',
      'Mongolia': 'Mongolia',
      'Republic of China': 'Taiwan',
      'Hong Kong Special Administrative Region': 'Hong Kong',
      'Macao Special Administrative Region': 'Macau',
      'Canada': 'Canada',
      'United Mexican States': 'Mexico',
      'Republic of Guatemala': 'Guatemala',
      'Republic of Belize': 'Belize',
      'Republic of El Salvador': 'El Salvador',
      'Republic of Honduras': 'Honduras',
      'Republic of Nicaragua': 'Nicaragua',
      'Republic of Costa Rica': 'Costa Rica',
      'Republic of Panama': 'Panama',
      'Republic of Cuba': 'Cuba',
      'Commonwealth of the Bahamas': 'Bahamas',
      'Jamaica': 'Jamaica',
      'Republic of Haiti': 'Haiti',
      'Commonwealth of Puerto Rico': 'Puerto Rico',
      'Anguilla': 'Anguilla',
      'Saint Martin': 'Saint Martin',
      'Saint Barthélemy': 'Saint Barthélemy',
      'Antigua and Barbuda': 'Antigua/Barbuda',
      'Montserrat': 'Montserrat',
      'Guadeloupe': 'Guadeloupe',
      'Dominica': 'Dominica',
      'Martinique': 'Martinique',
      'Saint Lucia': 'Saint Lucia',
      'Barbados': 'Barbados',
      'Grenada': 'Grenada',
      'Aruba': 'Aruba',
      'Curaçao': 'Curaçao',
      'Bonaire, Sint Eustatius and Saba': 'Bonaire, Saba',
      'Sint Maarten': 'Sint Maarten',
      'Cayman Islands': 'Cayman Islands',
      'Bermuda': 'Bermuda',
      'Greenland': 'Greenland',
      'Faroe Islands': 'Faroe Islands',
      'Argentine Republic': 'Argentina',
      'Plurinational State of Bolivia': 'Bolivia',
      'Federative Republic of Brazil': 'Brazil',
      'Republic of Chile': 'Chile',
      'Republic of Colombia': 'Colombia',
      'Republic of Ecuador': 'Ecuador',
      'French Guiana': 'French Guiana',
      'Co-operative Republic of Guyana': 'Guyana',
      'Republic of Paraguay': 'Paraguay',
      'Republic of Peru': 'Peru',
      'Republic of Suriname': 'Suriname',
      'Oriental Republic of Uruguay': 'Uruguay',
      'Bolivarian Republic of Venezuela': 'Venezuela',
      'Republic of Kazakhstan': 'Kazakhstan',
      'Kyrgyz Republic': 'Kyrgyzstan',
      'Republic of Tajikistan': 'Tajikstan',
      'Turkmenistan': 'Turkmenistan',
      'Republic of Uzbekistan': 'Uzbekistan',
      'Islamic Republic of Iran': 'Iran',
      'Republic of Iraq': 'Iraq',
      'Syrian Arab Republic': 'Syria',
      'Lebanese Republic': 'Lebanon',
      'Hashemite Kingdom of Jordan': 'Jordan',
      'State of Israel': 'Israel',
      'State of Palestine': 'Palestine',
      'Kingdom of Saudi Arabia': 'Saudi Arabia',
      'Republic of Yemen': 'Yemen',
      'Sultanate of Oman': 'Oman',
      'United Arab Emirates': 'UAE',
      'State of Qatar': 'Qatar',
      'State of Bahrain': 'Bahrain',
      'State of Kuwait': 'Kuwait',
      'Republic of Armenia': 'Armenia',
      'Republic of Azerbaijan': 'Azerbaijan',
      'Georgia': 'Georgia'
    };
    
    // Check direct mapping first
    if (nameMapping[globeCountryName]) {
      return nameMapping[globeCountryName];
    }
    
    // Return the original name if no mapping found
    return globeCountryName;
  };

  useEffect(() => {
    fetch('./datasets/ne_110m_admin_0_countries_clean.geojson')
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

  // Load revenue color data
  useEffect(() => {
    const loadRevenueColorData = async () => {
      try {
        const response = await fetch('./datasets/revenue_color_data.json');
        const colorData = await response.json();
        console.log('🎨 REVENUE COLOR DATA LOADED:', Object.keys(colorData.country_colors).length, 'countries');
        setPmiColorData(colorData);
      } catch (error) {
        console.error('Error loading revenue color data:', error);
        setPmiColorData(null);
      }
    };
    loadRevenueColorData();
  }, []);

  // Set camera zoom limits after globe is ready
  useEffect(() => {
    if (globeRef.current && countries.features?.length > 0) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.minDistance = 110;  // Closest zoom (much closer inspection)
        controls.maxDistance = 400;  // Furthest zoom (keeps globe substantial and visible)
        console.log('🎥 Camera zoom limits set:', { minDistance: 110, maxDistance: 400 });
      }
    }
  }, [countries.features, airports.length]); // Run after data loads to ensure globe is ready

  // Cleanup spotlight timeout on unmount
  useEffect(() => {
    return () => {
      if (spotlightTimeoutRef.current) {
        clearTimeout(spotlightTimeoutRef.current);
      }
    };
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
    // Filter out only Antarctica - show all countries since sales data is removed
    const countryPolygons = countries.features?.filter(d => 
      d.properties.ISO_A2 !== 'AQ'
    ) || [];
    
    console.log(`🌍 Displaying ${countryPolygons.length} countries (all countries visible - revenue-based coloring)`);
    
    // Only add airport polygons when a country is selected (airports only interactive after country selection)
    if (selectedCountry && selectedCountryAirports.length > 0) {
      console.log(`✈️ Adding ${selectedCountryAirports.length} airport polygons for interaction`);
      return [...countryPolygons, ...selectedCountryAirports];
    }
    
    // Before country selection: only countries are interactive
    return countryPolygons;
  }, [countries.features, selectedCountryAirports, selectedCountry]);

  // Prepare airport labels data for displaying airport codes
  const airportLabels = useMemo(() => {
    if (!selectedCountry || !selectedCountryAirports.length) return [];
    
    return selectedCountryAirports.map(airportPolygon => {
      const airport = airportPolygon.properties.airport_data;
      
      // Labels follow the parent country's hover state (selectedCountry)
      const isParentCountryHovered = selectedCountry === hoverD;
      
      return {
        lat: airport.lat + 0.3, // Offset slightly north to avoid collision with airport point
        lng: airport.lng + 0.3, // Offset slightly east to avoid collision with airport point
        text: airport.iata_code || airport.airport_code || 'N/A',
        color: '#ffffff', // White text for better visibility
        size: 0.18, // 30% of original size (0.6 * 0.3 = 0.18)
        altitude: isParentCountryHovered ? 0.135 : 0.075, // Rise with airports when parent country hovered
        airport: airport, // Store airport data for reference
        airportPolygon: airportPolygon // Store reference to the polygon for hover detection
      };
    });
  }, [selectedCountry, selectedCountryAirports, hoverD]);

  // Remove unused getVal function since we're using revenue-based coloring now

  // Revenue-based color scale for country coloring
  const { colorScale, globalData } = useMemo(() => {
    if (!countries.features || countries.features.length === 0 || !pmiColorData) {
      return { 
        colorScale: () => '#666666', 
        globalData: {}
      };
    }

    // Log the analysis
    console.log('🌍 REVENUE COLOR ANALYSIS:');
    console.log(`📊 Total countries loaded: ${countries.features.length}`);
    console.log(`🎨 Revenue color data available for: ${Object.keys(pmiColorData.country_colors).length} countries`);
    console.log(`🗺️  Countries colored by total revenue performance (9-bin percentile scheme)`);
    console.log(`💰 Revenue range: $${pmiColorData.statistics?.revenue_range?.min?.toLocaleString()} - $${pmiColorData.statistics?.revenue_range?.max?.toLocaleString()}`);
    console.log(`✈️ Airport-specific DF-MACASE data available through country selection`);

    // Revenue-based color function
    const colorScale = (countryName) => {
      if (!countryName || !pmiColorData) return '#666666';
      
      // Map globe country name to revenue data country name
      const mappedName = mapCountryName(countryName);
      
      // Get color from revenue data
      const color = pmiColorData.country_colors[mappedName];
      
      if (color) {
        return color;
      }
      
      // Fallback to grey if no revenue data found
      return '#666666';
    };

    // Count countries by color for analysis
    const colorStats = {};
    countries.features.forEach(feature => {
      const countryName = feature.properties.ADMIN || feature.properties.NAME;
      const color = colorScale(countryName);
      colorStats[color] = (colorStats[color] || 0) + 1;
    });

    console.log('🎨 Country color distribution:', colorStats);

    return {
      colorScale,
      globalData: {
        totalCountries: countries.features.length,
        dataType: 'Revenue-Based Coloring',
        revenueDataAvailable: true,
        colorStats
      }
    };
  }, [countries, pmiColorData]);

  // Polygon styling for both countries and airports
  const getPolygonColor = (polygon) => {
    // Airport polygons - CYAN TOPS (always cyan, no conflicts)
    if (polygon.properties.type === 'airport') {
      return '#00ffe7'; // Cyan for all airports
    }
    
    // Spotlight effect: darken all countries except selected
    if (spotlightActive && polygon !== selectedCountry) {
      return 'rgba(40, 40, 40, 0.3)'; // Much darker for non-selected countries during spotlight
    }
    
    // Country polygons - hover state
    if (polygon === hoverD) {
      return 'steelblue'; // Hover state for countries
    }
    
    // Country polygons - revenue-based coloring
    const countryName = polygon.properties.ADMIN || polygon.properties.NAME;
    return colorScale(countryName);
  };

  // Polygon altitude for both countries and airports
  const getPolygonAltitude = (polygon) => {
    // Airport polygons - always follow their parent country (selected country)
    if (polygon.properties.type === 'airport') {
      // Airports are elevated when their parent country (selectedCountry) is hovered OR selected
      const isParentCountryHovered = selectedCountry === hoverD;
      const isParentCountrySelected = selectedCountry !== null;
      return (isParentCountryHovered || isParentCountrySelected) ? 0.125 : 0.065; // Slightly above country layer
    }
    
    // Country polygons - elevated when hovered OR selected
    const isHovered = polygon === hoverD;
    const isSelected = polygon === selectedCountry;
    return (isHovered || isSelected) ? 0.12 : 0.06;
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

  // Enhanced border properties for spotlight effect
  const getPolygonStrokeColor = (polygon) => {
    if (spotlightActive && polygon === selectedCountry) {
      return '#00ffe7'; // Bright cyan for selected country during spotlight
    }
    return '#111'; // Default dark border
  };

  const getPolygonStrokeWidth = (polygon) => {
    if (spotlightActive && polygon === selectedCountry) {
      return 3.0; // Much thicker border for selected country during spotlight
    }
    return 1.3; // Default border width
  };

  // Helper function to calculate country centroid and bounds
  const calculateCountryCentroid = (countryFeature) => {
    if (!countryFeature || !countryFeature.geometry) return { lat: 0, lng: 0, bounds: null };
    
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    const processCoordinates = (coords, depth = 0) => {
      if (depth === 0 && Array.isArray(coords[0][0])) {
        // MultiPolygon or Polygon with holes
        coords.forEach(ring => processCoordinates(ring, depth + 1));
      } else if (depth === 1 && Array.isArray(coords[0])) {
        // Polygon ring
        coords.forEach(point => {
          if (Array.isArray(point) && point.length >= 2) {
            const lng = point[0];
            const lat = point[1];
            
            totalLng += lng;
            totalLat += lat;
            pointCount++;
            
            // Track bounds
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
          }
        });
      }
    };
    
    try {
      if (countryFeature.geometry.type === 'Polygon') {
        processCoordinates(countryFeature.geometry.coordinates);
      } else if (countryFeature.geometry.type === 'MultiPolygon') {
        countryFeature.geometry.coordinates.forEach(polygon => {
          processCoordinates(polygon);
        });
      }
      
      if (pointCount > 0) {
        return {
          lat: totalLat / pointCount,
          lng: totalLng / pointCount,
          bounds: {
            north: maxLat,
            south: minLat,
            east: maxLng,
            west: minLng,
            width: maxLng - minLng,
            height: maxLat - minLat
          }
        };
      }
    } catch (error) {
      console.warn('Error calculating centroid for country:', error);
    }
    
    return { lat: 0, lng: 0, bounds: null };
  };

  // Smart zoom function that adapts to UI layout and elevation
  const calculateOptimalZoom = (countryBounds) => {
    if (!countryBounds) return 0.35; // fallback

    // Detect UI panel states
    const isDashboardVisible = selectedCountry !== null;
    const isAnalyticsPanelVisible = selectedAirport !== null;
    
    // Calculate available screen percentage
    let availableWidthPercent = 1.0; // 100% width available by default
    
    if (isDashboardVisible && isAnalyticsPanelVisible) {
      // Both panels visible - middle space available
      availableWidthPercent = 0.45; // Approximately 45% width available (accounting for both panels)
    } else if (isDashboardVisible || isAnalyticsPanelVisible) {
      // One panel visible - about 70% width available
      availableWidthPercent = 0.70;
    }
    // If no panels visible, use full width (1.0)
    
    // Country size factors (flat coordinates)
    const countryWidth = countryBounds.width;
    const countryHeight = countryBounds.height;
    
    // ELEVATION COMPENSATION - Account for elevated cone size
    // When elevated (0.12 vs 0.06), the country appears significantly larger on screen
    const elevationMultiplier = 1.5; // Elevated countries appear ~50% larger visually
    const elevatedWidth = countryWidth * elevationMultiplier;
    const elevatedHeight = countryHeight * elevationMultiplier;
    
    // Base zoom calculation using ELEVATED size
    let baseAltitude = 0.25;
    
    // Adjust based on ELEVATED country size (not flat size)
    const elevatedSizeMultiplier = Math.max(elevatedWidth, elevatedHeight);
    
    if (elevatedSizeMultiplier > 75) {
      // Very large countries when elevated (like Russia, Canada)
      baseAltitude = 0.8;
    } else if (elevatedSizeMultiplier > 45) {
      // Large countries when elevated (like USA, China, Brazil)  
      baseAltitude = 0.6;
    } else if (elevatedSizeMultiplier > 22) {
      // Medium countries when elevated (like Germany, France)
      baseAltitude = 0.45;
    } else if (elevatedSizeMultiplier > 12) {
      // Small countries when elevated (like UK, Japan)
      baseAltitude = 0.3;
    } else {
      // Very small countries when elevated (like Malta, Luxembourg)
      baseAltitude = 0.2;
    }
    
    // Adjust for available screen space
    const uiConstraintMultiplier = 1 / availableWidthPercent;
    const finalAltitude = baseAltitude * uiConstraintMultiplier * 0.85; // 0.85 for optimal fit
    
    console.log(`🎥 Smart Zoom Calculation (Elevation-Aware):
      Flat Country: ${countryWidth.toFixed(1)}°×${countryHeight.toFixed(1)}°
      Elevated Country: ${elevatedWidth.toFixed(1)}°×${elevatedHeight.toFixed(1)}°
      UI Layout: Dashboard=${isDashboardVisible}, Analytics=${isAnalyticsPanelVisible}
      Available Width: ${(availableWidthPercent * 100).toFixed(0)}%
      Base Altitude: ${baseAltitude}
      Final Altitude: ${finalAltitude.toFixed(2)}`);
    
    return Math.max(0.1, Math.min(1.2, finalAltitude)); // Allow up to 1.2 for very large elevated countries
  };

  // Event handlers
  const handlePolygonClick = (polygon) => {
    if (polygon.properties.type === 'airport') {
      // Airports are only clickable when a country is selected
      if (selectedCountry) {
        const airportData = polygon.properties.airport_data;
        setSelectedAirport(airportData);
        console.log('Airport selected:', airportData?.iata_code, airportData?.airport_name);
        
        // Center camera on the selected airport
        if (globeRef.current && airportData.lat && airportData.lng) {
          globeRef.current.pointOfView(
            { lat: airportData.lat, lng: airportData.lng, altitude: 0.5 },
            1000 // 1 second smooth animation
          );
          console.log(`🎥 Centering on airport: ${airportData.iata_code} at ${airportData.lat}, ${airportData.lng}`);
        }
      }
    } else {
      // Countries are clickable when not already selected
      if (polygon !== selectedCountry) {
        setSelectedCountry(polygon);
        setSelectedAirport(null); // Clear airport selection when country changes
        
        const countryName = polygon.properties.ADMIN || polygon.properties.NAME;
        console.log('Selected country:', countryName);
        
        // Calculate and center on country centroid with smart zoom
        const centroidData = calculateCountryCentroid(polygon);
        if (globeRef.current && centroidData.lat !== 0 && centroidData.lng !== 0) {
          const optimalAltitude = calculateOptimalZoom(centroidData.bounds);
          
          globeRef.current.pointOfView(
            { lat: centroidData.lat, lng: centroidData.lng, altitude: optimalAltitude },
            1500 // 1.5 seconds smooth animation for countries (slightly longer for larger areas)
          );
          console.log(`🎥 Smart centering on country: ${countryName} at ${centroidData.lat.toFixed(2)}, ${centroidData.lng.toFixed(2)} with altitude ${optimalAltitude.toFixed(2)}`);
        }
        
        // Clear any existing spotlight timeout
        if (spotlightTimeoutRef.current) {
          clearTimeout(spotlightTimeoutRef.current);
        }
        
        // Activate spotlight effect after zoom animation completes
        spotlightTimeoutRef.current = setTimeout(() => {
          setSpotlightActive(true);
        }, 1500); // Wait for zoom animation to complete
      }
    }
  };

  const handleBackToGlobal = () => {
    setSelectedCountry(null);
    setSelectedAirport(null);
    setSpotlightActive(false); // Clear spotlight effect
    
    // Clear any pending spotlight timeout
    if (spotlightTimeoutRef.current) {
      clearTimeout(spotlightTimeoutRef.current);
      spotlightTimeoutRef.current = null;
    }
  };

  // Handle clicks on globe background (outside countries)
  const handleGlobeClick = (event) => {
    // Only deselect if we actually have a selected country
    if (selectedCountry) {
      setSelectedCountry(null);
      setSelectedAirport(null);
      setSpotlightActive(false); // Clear spotlight effect
      
      // Clear any pending spotlight timeout
      if (spotlightTimeoutRef.current) {
        clearTimeout(spotlightTimeoutRef.current);
        spotlightTimeoutRef.current = null;
      }
      
      console.log('🌍 Clicked on globe background - deselecting country');
    }
  };

  // Custom hover handler for proper country-first interaction
  const handlePolygonHover = (polygon) => {
    if (!polygon) {
      // When hovering over nothing, clear hover
      setHoverD(null);
      return;
    }

    if (polygon.properties.type === 'airport') {
      // When hovering over an airport (only possible after country selection),
      // keep the parent country elevated by setting hover to the selected country
      if (selectedCountry) {
        setHoverD(selectedCountry);
      }
    } else {
      // When hovering over a country, set hover normally
      setHoverD(polygon);
    }
  };

  return (
    <>
      <Globe
        ref={globeRef}
        globeImageUrl="./earth-night.jpg"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}

        // Atmosphere settings for better visibility
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.25}

        // Globe click handler for clicking outside countries
        onGlobeClick={handleGlobeClick}

        // ALL POLYGONS: Countries and airports rendered as cone polygons
        polygonsData={allPolygons}
        polygonAltitude={getPolygonAltitude}
        polygonCapColor={getPolygonColor}
        polygonSideColor={getPolygonSideColor} // Transparent sides for airports
        polygonStrokeColor={getPolygonStrokeColor}
        polygonStrokeWidth={getPolygonStrokeWidth}
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
                {airport.spend_per_pax > 0 && (
                  <div>💵 Revenue: ${(airport.pax * airport.spend_per_pax).toLocaleString()}</div>
                )}
              </div>
            );
          }
          
          // Country label - simplified to just flag and name
          const countryName = d.ADMIN || d.NAME;
          const countryISO = d.ISO_A2;
          const flagEmoji = getCountryFlag(countryISO);
          
          return (
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '120px'
            }}>
              <span style={{ fontSize: '20px' }}>{flagEmoji}</span>
              <span style={{ fontWeight: 'bold' }}>{countryName}</span>
            </div>
          );
        }}
        onPolygonHover={handlePolygonHover}
        onPolygonClick={handlePolygonClick}
        polygonsTransitionDuration={300}

        // Airport code labels with collision detection
        labelsData={airportLabels}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelAltitude={d => d.altitude}
        labelSize={d => d.size}
        labelText={d => d.text}
        labelColor={d => d.color}
        labelResolution={2} // Higher resolution for better text quality
        labelIncludeDot={false} // Don't show dots, just text
        labelDotRadius={0} // No dots at all
        labelsTransitionDuration={300}
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