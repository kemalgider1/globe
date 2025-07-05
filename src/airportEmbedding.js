// Example implementation: Embedding airports into Egypt's polygon geometry

// Original Egypt polygon from your data
const originalEgyptPolygon = {
  "type": "Feature",
  "properties": {
    "ADMIN": "Egypt",
    "NAME": "Egypt",
    "ISO_A2": "EG",
    "ISO_A3": "EGY",
    "volume_2024": 434953.682,
    "volume_2023": 464920.513,
    "pmi_volume_2024": 292670.535,
    "pmi_percentage": 67.28774743421991
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [36.86623, 22],
        [32.9, 22],
        [29.02, 22],
        [25, 22],
        [25, 25.6825],
        [25, 29.238655],
        [24.70007, 30.04419],
        [24.95762, 30.6616],
        [24.80287, 31.08929],
        [25.16482, 31.56915],
        [26.49533, 31.58568],
        [27.45762, 31.32126],
        [28.45048, 31.02577],
        [28.91353, 30.87005],
        [29.68342, 31.18686],
        [30.09503, 31.4734],
        [30.97693, 31.55586],
        [31.68796, 31.4296],
        [31.96041, 30.9336],
        [32.19247, 31.26034],
        [32.99392, 31.02407],
        [33.7734, 30.96746],
        [34.265435, 31.219357],
        [34.26544, 31.21936],
        [34.823243, 29.761081],
        [34.9226, 29.50133],
        [34.64174, 29.09942],
        [34.42655, 28.34399],
        [34.15451, 27.8233],
        [33.92136, 27.6487],
        [33.58811, 27.97136],
        [33.13676, 28.41765],
        [32.42323, 29.85108],
        [32.32046, 29.76043],
        [32.73482, 28.70523],
        [33.34876, 27.69989],
        [34.10455, 26.14227],
        [34.47387, 25.59856],
        [34.79507, 25.03375],
        [35.69241, 23.92671],
        [35.49372, 23.75237],
        [35.52598, 23.10244],
        [36.69069, 22.20485],
        [36.86623, 22]
      ]
    ]
  }
};

// Sample Egypt airports from your airports_points.json
const egyptAirports = [
  { "lat": 30.121944, "lng": 31.405556, "iata_code": "CAI", "airport_name": "Cairo Intl Airport" },
  { "lat": 31.184478, "lng": 29.949806, "iata_code": "ALY", "airport_name": "Alexandria Intl Airport" },
  { "lat": 27.044444, "lng": 30.906667, "iata_code": "LXR", "airport_name": "Luxor Intl Airport" },
  { "lat": 24.095278, "lng": 32.899722, "iata_code": "ASW", "airport_name": "Aswan Intl Airport" },
  { "lat": 27.977778, "lng": 34.395, "iata_code": "SSH", "airport_name": "Sharm El-Sheikh Intl Airport" }
];

// Function to create a small circular polygon for an airport
function createAirportCircle(lat, lng, radiusKm = 0.2) {
  const points = 12; // Number of points for the circle
  const coordinates = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;

    // Convert radius from km to degrees (rough approximation)
    const latOffset = (radiusKm / 111) * Math.cos(angle);
    const lngOffset = (radiusKm / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);

    coordinates.push([lng + lngOffset, lat + latOffset]);
  }

  return coordinates;
}

// Function to check if a point is inside Egypt's polygon (simple bounding box check)
function isPointInEgypt(lat, lng) {
  return lat >= 22 && lat <= 31.6 && lng >= 24.7 && lng <= 36.9;
}

// Create Egypt with embedded airports
function createEgyptWithAirports() {
  const egyptWithAirports = JSON.parse(JSON.stringify(originalEgyptPolygon));

  // Filter airports that are actually in Egypt
  const validAirports = egyptAirports.filter(airport =>
    isPointInEgypt(airport.lat, airport.lng)
  );

  console.log(`Adding ${validAirports.length} airports to Egypt polygon`);

  // Add airport circles as holes in the polygon
  validAirports.forEach(airport => {
    const airportCircle = createAirportCircle(airport.lat, airport.lng, 0.15);
    egyptWithAirports.geometry.coordinates.push(airportCircle);
    console.log(`Added ${airport.iata_code} (${airport.airport_name}) at [${airport.lng}, ${airport.lat}]`);
  });

  // Add airport data to properties for reference
  egyptWithAirports.properties.airports = validAirports;
  egyptWithAirports.properties.airport_count = validAirports.length;

  return egyptWithAirports;
}

// Alternative approach: Create separate small polygons for each airport
function createEgyptAirportPolygons() {
  const airportPolygons = [];

  egyptAirports
    .filter(airport => isPointInEgypt(airport.lat, airport.lng))
    .forEach(airport => {
      const airportCircle = createAirportCircle(airport.lat, airport.lng, 0.1);

      airportPolygons.push({
        "type": "Feature",
        "properties": {
          "type": "airport",
          "iata_code": airport.iata_code,
          "airport_name": airport.airport_name,
          "country": "Egypt",
          "parent_country": "EG"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [airportCircle]
        }
      });
    });

  return airportPolygons;
}

// Example usage in your App.js:
function enhanceCountriesWithAirports(countries, airports, selectedCountry) {
  if (!selectedCountry) return countries;

  const selectedCountryName = selectedCountry.properties.ADMIN || selectedCountry.properties.NAME;

  return countries.map(country => {
    const countryName = country.properties.ADMIN || country.properties.NAME;

    // Only modify the selected country
    if (countryName === selectedCountryName) {

      // Special handling for Egypt
      if (country.properties.ISO_A2 === 'EG') {
        return createEgyptWithAirports();
      }

      // For other countries, you'd implement similar logic
      // using their specific polygon coordinates and airport data

    }

    return country;
  });
}

// Test the implementation
console.log("=== EGYPT AIRPORT EMBEDDING TEST ===");

// Method 1: Airports as holes in Egypt polygon
const egyptWithHoles = createEgyptWithAirports();
console.log("Egypt with airport holes:");
console.log(`- Main polygon: ${egyptWithHoles.geometry.coordinates[0].length} border points`);
console.log(`- Airport holes: ${egyptWithHoles.geometry.coordinates.length - 1} airports`);
console.log(`- Airport details:`, egyptWithHoles.properties.airports);

// Method 2: Airports as separate small polygons
const airportPolygons = createEgyptAirportPolygons();
console.log("\nSeparate airport polygons:");
console.log(`- Created ${airportPolygons.length} airport polygons`);

// Export both approaches for testing
const testData = {
  original: originalEgyptPolygon,
  withHoles: egyptWithHoles,
  airportPolygons: airportPolygons,
  implementation: enhanceCountriesWithAirports
};

console.log("\n✅ Test data ready for Globe component integration");
console.log("Use 'testData.withHoles' for hole-based approach");
console.log("Use 'testData.airportPolygons' for separate polygon approach");

// Return the test data for integration
module.exports = testData;