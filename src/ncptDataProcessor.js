import React from 'react';
import Papa from 'papaparse';

// NCPT Data Processor for Category Funnel Analytics
export class NCPTDataProcessor {
  constructor() {
    this.rawData = [];
    this.processedData = {
      global: {},
      countries: {},
      airports: {}
    };
  }

  // Load and parse NCPT CSV data
  async loadNCPTData(csvPath = './datasets/NCPT/Top10NationalityNCPT.csv') {
    try {
      console.log('📂 Loading NCPT data from:', csvPath);
      
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log('📄 NCPT CSV loaded:', (csvText.length / 1024 / 1024).toFixed(1), 'MB');

      const parsed = Papa.parse(csvText, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        transformHeader: (header) => header.replace(/"/g, "").trim(),
      });

      this.rawData = parsed.data.filter(row => 
        row.Region && row.Country && row['Airport Name'] && row.Nationality
      );

      console.log('✅ NCPT data processed:', this.rawData.length, 'records');
      
      // Process the data into different aggregation levels
      this.processGlobalMetrics();
      this.processCountryMetrics();
      this.processAirportMetrics();
      
      return this.processedData;
    } catch (error) {
      console.error('❌ Error loading NCPT data:', error);
      throw error;
    }
  }

  // Calculate global weighted averages
  processGlobalMetrics() {
    const validRecords = this.rawData.filter(row => 
      parseFloat(row['PAX (Mio)']) > 0
    );

    let totalPAX = 0;
    const categoryTotals = {
      P1: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P4_Disposable: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P4_Closed: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P5: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 }
    };

    validRecords.forEach(row => {
      const pax = parseFloat(row['PAX (Mio)']) || 0;
      totalPAX += pax;

      // Process each category if data exists
      this.processRowCategory(row, 'P1', pax, categoryTotals.P1);
      this.processRowCategory(row, 'P4 Disposable', pax, categoryTotals.P4_Disposable);
      this.processRowCategory(row, 'P4 Closed', pax, categoryTotals.P4_Closed);
      this.processRowCategory(row, 'P5', pax, categoryTotals.P5);
    });

    // Calculate weighted averages
    this.processedData.global = {
      totalPAX: totalPAX,
      totalRecords: validRecords.length,
      categories: {}
    };

    Object.keys(categoryTotals).forEach(category => {
      const cat = categoryTotals[category];
      if (cat.weight > 0) {
        this.processedData.global.categories[category] = {
          awareness: (cat.awareness / cat.weight).toFixed(3),
          trial: (cat.trial / cat.weight).toFixed(3),
          p7d: (cat.p7d / cat.weight).toFixed(3),
          growth: (cat.growth / cat.weight).toFixed(3),
          conversionRate: cat.trial > 0 ? ((cat.trial / cat.awareness) * 100).toFixed(1) : 0
        };
      }
    });
  }

  // Process individual row for category metrics
  processRowCategory(row, categoryName, pax, categoryTotal) {
    const awareness = this.parsePercentage(row[`Average of ${categoryName} Awareness`]);
    const trial = this.parsePercentage(row[`Average of ${categoryName} Trial`]);
    const p7d = this.parsePercentage(row[`Average of ${categoryName} P7D`]);
    const growth = this.parsePercentage(row[`Average of ${categoryName} Growth`]);

    if (awareness !== null && trial !== null) {
      categoryTotal.awareness += awareness * pax;
      categoryTotal.trial += trial * pax;
      categoryTotal.p7d += (p7d || 0) * pax;
      categoryTotal.growth += (growth || 0) * pax;
      categoryTotal.weight += pax;
    }
  }

  // Process country-level aggregations
  processCountryMetrics() {
    const countryGroups = {};
    
    this.rawData.forEach(row => {
      const country = row.Country;
      if (!countryGroups[country]) {
        countryGroups[country] = [];
      }
      countryGroups[country].push(row);
    });

    this.processedData.countries = {};
    
    Object.keys(countryGroups).forEach(country => {
      const countryData = this.aggregateCountryData(countryGroups[country]);
      if (countryData.totalPAX > 0) {
        this.processedData.countries[country] = countryData;
      }
    });
  }

  // Aggregate data for a specific country
  aggregateCountryData(countryRows) {
    let totalPAX = 0;
    const nationalityBreakdown = {};
    const categoryTotals = {
      P1: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P4_Disposable: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P4_Closed: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P5: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 }
    };

    countryRows.forEach(row => {
      const pax = parseFloat(row['PAX (Mio)']) || 0;
      const nationality = row.Nationality;
      
      totalPAX += pax;

      // Track nationality breakdown
      if (!nationalityBreakdown[nationality]) {
        nationalityBreakdown[nationality] = { pax: 0, share: 0 };
      }
      nationalityBreakdown[nationality].pax += pax;

      // Process categories
      this.processRowCategory(row, 'P1', pax, categoryTotals.P1);
      this.processRowCategory(row, 'P4 Disposable', pax, categoryTotals.P4_Disposable);
      this.processRowCategory(row, 'P4 Closed', pax, categoryTotals.P4_Closed);
      this.processRowCategory(row, 'P5', pax, categoryTotals.P5);
    });

    // Calculate shares and sort nationalities
    const topNationalities = Object.entries(nationalityBreakdown)
      .map(([nationality, data]) => ({
        nationality,
        pax: data.pax,
        share: totalPAX > 0 ? (data.pax / totalPAX * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.pax - a.pax)
      .slice(0, 10);

    // Calculate weighted category averages
    const categories = {};
    Object.keys(categoryTotals).forEach(category => {
      const cat = categoryTotals[category];
      if (cat.weight > 0) {
        categories[category] = {
          awareness: (cat.awareness / cat.weight).toFixed(3),
          trial: (cat.trial / cat.weight).toFixed(3),
          p7d: (cat.p7d / cat.weight).toFixed(3),
          growth: (cat.growth / cat.weight).toFixed(3),
          conversionRate: cat.trial > 0 ? ((cat.trial / cat.awareness) * 100).toFixed(1) : 0
        };
      }
    });

    return {
      totalPAX: totalPAX.toFixed(1),
      topNationalities,
      categories,
      region: countryRows[0]?.Region || 'Unknown'
    };
  }

  // Process airport-level data with nationality breakdown
  processAirportMetrics() {
    const airportGroups = {};
    
    this.rawData.forEach(row => {
      const airportKey = `${row['Airport Name']}_${row.Country}`;
      if (!airportGroups[airportKey]) {
        airportGroups[airportKey] = {
          airportName: row['Airport Name'],
          country: row.Country,
          region: row.Region,
          records: []
        };
      }
      airportGroups[airportKey].records.push(row);
    });

    this.processedData.airports = {};
    
    Object.keys(airportGroups).forEach(airportKey => {
      const airportInfo = airportGroups[airportKey];
      const airportData = this.aggregateAirportData(airportInfo.records);
      
      if (airportData.totalPAX > 0) {
        this.processedData.airports[airportInfo.airportName] = {
          ...airportData,
          country: airportInfo.country,
          region: airportInfo.region
        };
      }
    });
  }

  // Aggregate data for a specific airport
  aggregateAirportData(airportRows) {
    let totalPAX = 0;
    const nationalityData = {};

    airportRows.forEach(row => {
      const pax = parseFloat(row['PAX (Mio)']) || 0;
      const nationality = row.Nationality;
      
      totalPAX += pax;

      if (!nationalityData[nationality]) {
        nationalityData[nationality] = {
          pax: 0,
          categories: {
            P1: { awareness: null, trial: null, p7d: null, growth: null },
            P4_Disposable: { awareness: null, trial: null, p7d: null, growth: null },
            P4_Closed: { awareness: null, trial: null, p7d: null, growth: null },
            P5: { awareness: null, trial: null, p7d: null, growth: null }
          }
        };
      }

      nationalityData[nationality].pax += pax;
      
      // Store category data for this nationality
      ['P1', 'P4 Disposable', 'P4 Closed', 'P5'].forEach(category => {
        const catKey = category.replace(' ', '_');
        nationalityData[nationality].categories[catKey] = {
          awareness: this.parsePercentage(row[`Average of ${category} Awareness`]),
          trial: this.parsePercentage(row[`Average of ${category} Trial`]),
          p7d: this.parsePercentage(row[`Average of ${category} P7D`]),
          growth: this.parsePercentage(row[`Average of ${category} Growth`])
        };
      });
    });

    // Create nationality breakdown with shares
    const nationalityBreakdown = Object.entries(nationalityData)
      .map(([nationality, data]) => ({
        nationality,
        pax: data.pax.toFixed(1),
        share: totalPAX > 0 ? (data.pax / totalPAX * 100).toFixed(1) : 0,
        categories: data.categories
      }))
      .sort((a, b) => parseFloat(b.pax) - parseFloat(a.pax))
      .slice(0, 10);

    // Calculate airport-level aggregated metrics
    const airportCategories = {
      P1: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P4_Disposable: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P4_Closed: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 },
      P5: { awareness: 0, trial: 0, p7d: 0, growth: 0, weight: 0 }
    };

    // Aggregate metrics across all nationalities, weighted by PAX
    Object.values(nationalityData).forEach(natData => {
      const weight = natData.pax;
      Object.keys(airportCategories).forEach(categoryKey => {
        const catData = natData.categories[categoryKey];
        if (catData && catData.awareness !== null) {
          airportCategories[categoryKey].awareness += catData.awareness * weight;
          airportCategories[categoryKey].trial += (catData.trial || 0) * weight;
          airportCategories[categoryKey].p7d += (catData.p7d || 0) * weight;
          airportCategories[categoryKey].growth += (catData.growth || 0) * weight;
          airportCategories[categoryKey].weight += weight;
        }
      });
    });

    // Calculate weighted averages for airport
    const aggregatedCategories = {};
    Object.keys(airportCategories).forEach(category => {
      const cat = airportCategories[category];
      if (cat.weight > 0) {
        aggregatedCategories[category] = {
          awareness: (cat.awareness / cat.weight).toFixed(3),
          trial: (cat.trial / cat.weight).toFixed(3),
          p7d: (cat.p7d / cat.weight).toFixed(3),
          growth: (cat.growth / cat.weight).toFixed(3),
          conversionRate: cat.trial > 0 ? ((cat.trial / cat.awareness) * 100).toFixed(1) : 0
        };
      }
    });

    return {
      totalPAX: totalPAX.toFixed(1),
      aggregatedCategories, // Airport-level metrics
      nationalityBreakdown  // Nationality-level breakdown
    };
  }

  // Helper function to parse percentage values
  parsePercentage(value) {
    if (!value || value === '') return null;
    const parsed = parseFloat(value.toString().replace('%', ''));
    return isNaN(parsed) ? null : parsed / 100; // Convert to decimal (0-1 range)
  }

  // Get data for specific levels
  getGlobalData() {
    return this.processedData.global;
  }

  getCountryData(countryName) {
    return this.processedData.countries[countryName] || null;
  }

  getAirportData(airportName) {
    return this.processedData.airports[airportName] || null;
  }

  // Get top performing countries by category
  getTopCountriesByCategory(category = 'P1', metric = 'trial', limit = 10) {
    return Object.entries(this.processedData.countries)
      .filter(([_, data]) => data.categories[category])
      .map(([country, data]) => ({
        country,
        value: parseFloat(data.categories[category][metric]) || 0,
        totalPAX: parseFloat(data.totalPAX)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }
}

// Export singleton instance
export const ncptProcessor = new NCPTDataProcessor();

// Hook for using NCPT data in React components
export const useNCPTData = () => {
  const [ncptData, setNCPTData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ncptProcessor.loadNCPTData();
        setNCPTData(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { ncptData, loading, error };
};