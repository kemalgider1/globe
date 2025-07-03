// src/dataProcessor.js
// Data processing module for CSV sales data

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Country name mapping to standardize names
export const COUNTRY_MAPPING = {
  "South Korea": "South Korea",
  "United Arab Emirates": "United Arab Emirates",
  "Korea": "South Korea",
  "UAE": "United Arab Emirates",
  "USA": "United States of America",
  "US": "United States of America",
  "UK": "United Kingdom",
  "China": "China",
  "Japan": "Japan",
  "Germany": "Germany",
  "France": "France",
  "Italy": "Italy",
  "Spain": "Spain",
  "Netherlands": "Netherlands",
  "Singapore": "Singapore",
  "Thailand": "Thailand",
  "Malaysia": "Malaysia",
  "Indonesia": "Indonesia",
  "Philippines": "Philippines",
  "Australia": "Australia",
  "New Zealand": "New Zealand",
  "Canada": "Canada",
  "Brazil": "Brazil",
  "Mexico": "Mexico",
  "Argentina": "Argentina",
  "Russia": "Russia",
  "Turkey": "Turkey",
  "Saudi Arabia": "Saudi Arabia",
  "Qatar": "Qatar",
  "Kuwait": "Kuwait",
  "Oman": "Oman",
  "Bahrain": "Bahrain",
  "Jordan": "Jordan",
  "Lebanon": "Lebanon",
  "Egypt": "Egypt",
  "Morocco": "Morocco",
  "Tunisia": "Tunisia",
  "Algeria": "Algeria",
  "South Africa": "South Africa",
  "India": "India",
  "Pakistan": "Pakistan",
  "Bangladesh": "Bangladesh",
  "Sri Lanka": "Sri Lanka",
  "Vietnam": "Vietnam",
  "Cambodia": "Cambodia",
  "Myanmar": "Myanmar",
  "Laos": "Laos"
};

// Process raw CSV data into country aggregations
export const processSalesData = (rawData) => {
  console.log('Processing', rawData.length, 'sales records...');

  const aggregated = {};
  let processedCount = 0;

  rawData.forEach((row, index) => {
    const market = row.DF_MARKET_NAME;
    if (!market || market.trim() === '') return;

    // Map to standard country name
    const countryName = COUNTRY_MAPPING[market.trim()] || market.trim();

    if (!aggregated[countryName]) {
      aggregated[countryName] = {
        totalVolume: 0,
        totalRevenue: 0,
        totalBoxes: 0,
        locations: new Set(),
        transactions: 0,
        originalMarketName: market.trim()
      };
    }

    // Parse and aggregate numeric values
    const volume = parseFloat(row.VOLUME) || 0;
    const revenue = parseFloat(row.USD_AMOUNT) || 0;
    const boxes = parseInt(row.BOXES_QUANTITY) || 0;
    const location = row.LOCATION_NAME?.trim();

    aggregated[countryName].totalVolume += volume;
    aggregated[countryName].totalRevenue += revenue;
    aggregated[countryName].totalBoxes += boxes;

    if (location) {
      aggregated[countryName].locations.add(location);
    }

    aggregated[countryName].transactions += 1;
    processedCount++;

    // Log progress for large datasets
    if (processedCount % 5000 === 0) {
      console.log(`Processed ${processedCount} records...`);
    }
  });

  // Convert location Sets to counts and clean up
  Object.keys(aggregated).forEach(country => {
    aggregated[country].locationCount = aggregated[country].locations.size;
    delete aggregated[country].locations; // Remove Set object
  });

  console.log('✅ Processing complete!');
  console.log('Countries with sales data:', Object.keys(aggregated).sort());
  console.log('Total countries:', Object.keys(aggregated).length);

  // Log top countries by volume
  const topCountries = Object.entries(aggregated)
    .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
    .slice(0, 5);

  console.log('Top 5 countries by volume:');
  topCountries.forEach(([country, data]) => {
    console.log(`  ${country}: ${data.totalVolume.toFixed(2)}`);
  });

  return aggregated;
};

// React hook for loading and processing sales data
export const useSalesData = (csvPath = './datasets/data.csv') => {
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading CSV data from:', csvPath);

        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        console.log('CSV loaded, size:', (csvText.length / 1024 / 1024).toFixed(1), 'MB');

        const parsed = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.replace(/"/g, '').trim() // Clean headers
        });

        if (parsed.errors.length > 0) {
          console.warn('CSV parsing warnings:', parsed.errors);
        }

        console.log('CSV parsed:', {
          rows: parsed.data.length,
          columns: parsed.meta.fields?.length || 0
        });

        const processedData = processSalesData(parsed.data);
        setSalesData(processedData);
        setLoading(false);

      } catch (err) {
        console.error('Error loading sales data:', err);
        setError(err);
        setLoading(false);
      }
    };

    loadData();
  }, [csvPath]);

  return { salesData, loading, error };
};

// Get country value for visualization
export const getCountryValue = (countryProperties, salesData, metric = 'volume') => {
  const countryName = countryProperties.ADMIN || countryProperties.NAME;
  const data = salesData[countryName];

  if (!data) return 0;

  switch (metric) {
    case 'volume':
      return data.totalVolume || 0;
    case 'revenue':
      return data.totalRevenue || 0;
    case 'transactions':
      return data.transactions || 0;
    case 'locations':
      return data.locationCount || 0;
    default:
      return data.totalVolume || 0;
  }
};

// Create tooltip content for country
export const createTooltip = (countryProperties, salesData) => {
  const countryName = countryProperties.ADMIN || countryProperties.NAME;
  const countryCode = countryProperties.ISO_A2;
  const data = salesData[countryName];

  if (!data) {
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div><b>{countryName} ({countryCode}):</b></div>
        <div>No sales data available</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '12px'
    }}>
      <div><b>{countryName} ({countryCode}):</b></div>
      <div>Volume: <i>{data.totalVolume.toFixed(2)}</i></div>
      <div>Revenue: <i>${data.totalRevenue.toLocaleString()}</i></div>
      <div>Locations: <i>{data.locationCount}</i></div>
      <div>Transactions: <i>{data.transactions.toLocaleString()}</i></div>
    </div>
  );
};
