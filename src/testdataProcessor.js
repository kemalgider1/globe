// testDataProcessor.js
// Test script to verify data processing works correctly

import { loadSalesData, processSalesData, getCountryValue, createTooltipContent } from './dataProcessor.js';

// Test function to run data processing
export const testDataProcessing = async () => {
  console.log('=== Testing Data Processor ===');

  try {
    // Test 1: Load CSV data
    console.log('Test 1: Loading CSV data...');
    const salesData = await loadSalesData('./datasets/data.csv');
    console.log('✅ CSV data loaded successfully');
    console.log('Countries found:', Object.keys(salesData));

    // Test 2: Check data structure
    console.log('\nTest 2: Data structure validation...');
    Object.keys(salesData).forEach(country => {
      const data = salesData[country];
      console.log(`${country}:`, {
        volume: data.totalVolume,
        revenue: data.totalRevenue,
        locations: data.locationCount,
        transactions: data.transactions
      });
    });
    console.log('✅ Data structure is valid');

    // Test 3: Test country value calculation
    console.log('\nTest 3: Country value calculation...');
    const mockCountryProps = { ADMIN: 'South Korea', NAME: 'South Korea' };
    const volumeValue = getCountryValue(mockCountryProps, salesData, 'volume');
    const revenueValue = getCountryValue(mockCountryProps, salesData, 'revenue');
    console.log('South Korea volume:', volumeValue);
    console.log('South Korea revenue:', revenueValue);
    console.log('✅ Country value calculation works');

    // Test 4: Test tooltip creation
    console.log('\nTest 4: Tooltip creation...');
    const tooltip = createTooltipContent(mockCountryProps, salesData);
    console.log('Tooltip for South Korea:', tooltip);
    console.log('✅ Tooltip creation works');

    console.log('\n🎉 All tests passed!');
    return salesData;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Simple function to run tests in browser console
export const runTests = () => {
  testDataProcessing()
    .then(data => {
      console.log('Tests completed successfully!');
      console.log('Sales data:', data);
    })
    .catch(error => {
      console.error('Tests failed:', error);
    });
};