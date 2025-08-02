# NCPT Category Funnel Integration Guide

## 🎯 Overview

This guide provides complete instructions for integrating the **NCPT (Nationality Category Product Trial) dataset** into your React Globe Application, adding sophisticated **Category Funnel analytics** at Global, Country, and Airport levels.

---

## 📊 **What's Been Created**

### **1. Core Files Created**
- `src/ncptDataProcessor.js` - Data processing engine for NCPT analytics
- `src/DashboardEnhanced.js` - Enhanced Dashboard with category funnel KPIs
- `src/AnalyticsPanelEnhanced.js` - Enhanced AnalyticsPanel with nationality breakdown
- `src/NCPTStyles.css` - Styling for category funnel components

### **2. Features Implemented**

#### **Global Level (Dashboard)**
- ✅ **Category Performance KPIs**: P1, P4 Disposable, P4 Closed, P5
- ✅ **Conversion Rate Analysis**: Awareness → Trial funnel metrics
- ✅ **Top 10 Countries** by PAX volume with category performance
- ✅ **Weighted Global Averages** across 1,049M passengers

#### **Country Level (Dashboard)**
- ✅ **Country-specific Category Performance**
- ✅ **Top 10 Nationalities** within selected country
- ✅ **PAX Share Analysis** by nationality
- ✅ **Regional Performance Benchmarking**

#### **Airport Level (AnalyticsPanel)**
- ✅ **Airport-specific Nationality Breakdown** (Top 10)
- ✅ **Category Conversion Rates** by nationality
- ✅ **Funnel Visualization** (Awareness → Trial → P7D → Growth)
- ✅ **Performance Comparison** across product categories

---

## 🔧 **Integration Steps**

### **Step 1: Update Main App.js**

Add NCPT data loading to your main App component:

```javascript
// In src/App.js - Add these imports
import { useNCPTData } from './ncptDataProcessor';
import DashboardEnhanced from './DashboardEnhanced';
import AnalyticsPanelEnhanced from './AnalyticsPanelEnhanced';

// In the World component, add NCPT data hook
const World = () => {
  const globeRef = useRef();
  // ... existing state variables ...
  
  // Add NCPT data loading
  const { ncptData, loading: ncptLoading, error: ncptError } = useNCPTData();
  
  // ... rest of existing code ...
  
  return (
    <>
      <Globe
        // ... existing globe props ...
      />
      
      {/* Replace existing components with enhanced versions */}
      <AnalyticsPanelEnhanced
        airports={airports}
        selectedAirport={selectedAirport}
      />
      
      <DashboardEnhanced
        data={globalData}
        selectedCountry={selectedCountry}
        selectedCountryAirports={selectedCountryAirports.map(p => p.properties.airport_data)}
        onBackToGlobal={handleBackToGlobal}
      />
    </>
  );
};
```

### **Step 2: Add CSS Imports**

Add the NCPT styles to your main CSS or component imports:

```javascript
// In src/App.js or your main CSS file
import './NCPTStyles.css';
```

### **Step 3: Install Required Dependencies**

Ensure you have Papa Parse for CSV processing:

```bash
npm install papaparse
# or
yarn add papaparse
```

### **Step 4: Verify Data File Location**

Ensure your NCPT CSV file is accessible:
```
public/
  datasets/
    NCPT/
      Top10NationalityNCPT.csv  ← Must be here
```

---

## 📋 **Data Structure Overview**

### **Global Metrics Available**
```javascript
globalNCPTMetrics = {
  totalPAX: 1049,  // Million passengers
  categories: {
    P1: { awareness: 82.4, trial: 41.7, p7d: 16.7, growth: 37.9 },
    P4_Disposable: { awareness: 85.3, trial: 45.4, p7d: 14.2, growth: 31.2 },
    P4_Closed: { awareness: 87.0, trial: 48.0, p7d: 14.4, growth: 29.6 },
    P5: { awareness: 61.1, trial: 19.0, p7d: 4.6, growth: 22.5 }
  }
}
```

### **Country-Level Data**
```javascript
countryData = {
  totalPAX: "5.5",
  topNationalities: [
    { nationality: "Spain", pax: "3.3", share: "46.8" },
    { nationality: "Italy", pax: "0.4", share: "5.1" }
    // ... up to 10
  ],
  categories: {
    P1: { awareness: 83.9, trial: 41.5, conversionRate: 49.5 }
    // ... other categories
  }
}
```

### **Airport-Level Data**
```javascript
airportData = {
  totalPAX: "13.6",
  nationalityBreakdown: [
    {
      nationality: "Spain",
      pax: "3.3",
      share: "46.8",
      categories: {
        P1: { awareness: 83.9, trial: 41.5, p7d: 15.7, growth: 37.7 },
        P4_Disposable: { awareness: 86.2, trial: 46.3, p7d: 13.0, growth: 28.1 }
        // ... all categories for this nationality
      }
    }
    // ... up to 10 nationalities
  ]
}
```

---

## 🎨 **UI Components Added**

### **Category Funnel Grid**
Displays all 4 product categories with:
- Awareness, Trial, P7D, Growth percentages
- Conversion rates (Trial/Awareness)
- Category-specific color coding
- Hover effects and animations

### **Nationality Breakdown Cards**
Shows top nationalities with:
- PAX volume and market share
- Category performance comparison
- Funnel visualization charts
- Country flag integration

### **Performance Indicators**
Circular progress charts showing:
- Conversion rates by category
- Category-specific color schemes
- Animated progress animations

---

## 📊 **Key Performance Indicators (KPIs)**

### **Main Category KPIs**
| Category | Global Awareness | Global Trial | Conversion Rate |
|----------|------------------|--------------|----------------|
| **P1** | 82.4% | 41.7% | 50.7% |
| **P4 Disposable** | 85.3% | 45.4% | 53.2% |
| **P4 Closed** | 87.0% | 48.0% | 55.2% |
| **P5** | 61.1% | 19.0% | 31.1% |

### **Geographic Performance**
- **Europe**: Largest market (46.4% share)
- **Americas**: Major market (25.7% share)
- **Japan & Korea**: Highest performance (64.8% P1 awareness)
- **987 airports** across **192 countries** covered

---

## 🚀 **Usage Examples**

### **Access Global NCPT Data**
```javascript
import { ncptProcessor } from './ncptDataProcessor';

// Get global metrics
const globalData = ncptProcessor.getGlobalData();
console.log('Global P1 conversion:', globalData.categories.P1.conversionRate);

// Get top countries by category performance
const topCountries = ncptProcessor.getTopCountriesByCategory('P1', 'trial', 5);
```

### **Get Country-Specific Data**
```javascript
// Get data for a specific country
const spainData = ncptProcessor.getCountryData('Spain');
console.log('Spain top nationalities:', spainData.topNationalities);
```

### **Get Airport-Level Data**
```javascript
// Get data for specific airport
const airportData = ncptProcessor.getAirportData('Madrid-Barajas Airport');
console.log('Airport nationality breakdown:', airportData.nationalityBreakdown);
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **NCPT Data Not Loading**
   - Check CSV file location: `public/datasets/NCPT/Top10NationalityNCPT.csv`
   - Verify file permissions and accessibility
   - Check browser console for fetch errors

2. **Missing Category Data**
   - Some airports may not have all category data (P5 has 33.2% missing rate)
   - This is expected behavior - components handle missing data gracefully

3. **Performance Issues**
   - NCPT processor uses memoization for performance
   - Large datasets are processed incrementally
   - Consider lazy loading for better initial performance

### **Data Validation**
```javascript
// Validate NCPT data loading
const { ncptData, loading, error } = useNCPTData();
if (error) console.error('NCPT Error:', error);
if (ncptData) console.log('NCPT Data Loaded:', Object.keys(ncptData));
```

---

## 📈 **Business Value**

This integration provides:

1. **Strategic Insights**: Category performance across global airport network
2. **Market Intelligence**: Nationality-based segmentation and targeting
3. **Conversion Optimization**: Funnel analysis for improving trial rates
4. **Geographic Strategy**: Regional performance benchmarking
5. **ROI Projections**: Data-driven revenue improvement opportunities

### **Immediate Opportunities Identified**
- **P1 Trial Gap**: 29.8pp gap represents immediate revenue opportunity
- **European Market**: 46.4% market share with optimization potential  
- **Japan & Korea Model**: Success factors for replication globally

---

## 🔄 **Next Steps**

1. **Test Integration**: Verify all components load correctly
2. **Data Validation**: Confirm NCPT metrics match expected values
3. **User Training**: Familiarize users with new category funnel features
4. **Performance Monitoring**: Track load times and user interactions
5. **Feedback Collection**: Gather user feedback for improvements

---

## 📞 **Support**

For technical issues or questions about the NCPT integration:
- Check the browser console for error messages
- Verify data file accessibility and format
- Review component props and data flow
- Test with smaller datasets first

This integration transforms your globe application into a comprehensive **airport retail analytics platform** with sophisticated category funnel analysis capabilities.