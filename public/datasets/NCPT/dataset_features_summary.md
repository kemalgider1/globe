# Dataset Features Summary
## Airport Nationality Category Funnel Analysis

---

## Feature Catalog

### 1. Dimensional Features (Categorical)

#### **Region** 
- **Type**: Categorical (7 categories)
- **Description**: Geographic region classification
- **Values**: Europe, Americas, Eurasia, China & SEA, Middle East, Africa, Japan & Korea
- **Distribution**: Europe (27.7%), Americas (27.1%), Others (45.2%)
- **Data Quality**: 99.7% complete
- **Analysis Value**: Primary segmentation dimension for geographic analysis

#### **Country**
- **Type**: Categorical (192 categories) 
- **Description**: Country where airport is located
- **Cardinality**: High diversity with long tail distribution
- **Top Values**: USA (10.1%), China (4.9%), UK (3.8%), Italy (3.7%)
- **Data Quality**: 100% complete
- **Analysis Value**: Granular geographic analysis, country-level performance

#### **Airport Name**
- **Type**: Categorical (987 categories)
- **Description**: Specific airport identifier
- **Cardinality**: Very high, mostly unique
- **Distribution**: Mostly 1 record per airport per nationality
- **Data Quality**: 100% complete  
- **Analysis Value**: Airport-level performance analysis, hub identification

#### **Nationality**
- **Type**: Categorical (10 categories)
- **Description**: Passenger nationality grouping
- **Values**: PRC, India, USA, UK, South Korea, Germany, Canada, France, Italy, Spain
- **Distribution**: Balanced (8.8% - 11.2% each)
- **Data Quality**: 100% complete
- **Analysis Value**: Core dimension for nationality-based segmentation

---

### 2. Volume & Share Features

#### **PAX (Mio)**
- **Type**: Continuous numeric
- **Description**: Passenger volume in millions
- **Range**: [0.000, 24.600]
- **Distribution**: Highly right-skewed (Skewness: 15.94)
- **Central Tendency**: Mean=0.133, Median=0.000
- **Variability**: CV=619.3% (extreme variation)
- **Missing**: 0%
- **Outliers**: Many expected (hub vs. regional airports)
- **Analysis Value**: Volume weighting, market size analysis, hub identification

#### **PAX Share**
- **Type**: Percentage (0-1 scale after cleaning)
- **Description**: Nationality's share of airport passenger volume  
- **Range**: [0.000, 1.000]
- **Distribution**: Right-skewed (Skewness: 3.47)
- **Central Tendency**: Mean=0.058, Median=0.002
- **Variability**: CV=266.7% (high variation)
- **Missing**: 0%
- **Analysis Value**: Market concentration analysis, dominance patterns

---

### 3. Product Performance Features

#### **P1 Category Metrics**
*Primary product line performance indicators*

**Average of P1 Awareness**
- **Type**: Percentage (0-1 scale)
- **Description**: Brand/product awareness rate for P1
- **Range**: [0.662, 0.926]
- **Distribution**: Nearly symmetric (Skewness: -0.101)
- **Central Tendency**: Mean=0.797, Median=0.801
- **Variability**: CV=10.3% (low variation)
- **Missing**: 22.1%
- **Analysis Value**: Top-funnel performance, brand strength indicator

**Average of P1 Trial**
- **Type**: Percentage (0-1 scale)
- **Description**: Trial/purchase rate for P1
- **Range**: [0.181, 0.664]
- **Distribution**: Moderately right-skewed (Skewness: 0.522)
- **Central Tendency**: Mean=0.398, Median=0.354
- **Variability**: CV=34.0% (moderate variation)
- **Missing**: 22.1%
- **Analysis Value**: Conversion effectiveness, trial optimization target

**Average of P1 P7D**
- **Type**: Percentage (0-1 scale)
- **Description**: 7-day post-trial engagement for P1
- **Missing**: 22.1%
- **Analysis Value**: Short-term retention, engagement quality

**Average of P1 Growth**
- **Type**: Percentage (0-1 scale)
- **Description**: Growth/repeat usage indicator for P1
- **Missing**: 22.1%
- **Analysis Value**: Long-term value, customer lifetime indicators

#### **P4 Disposable Category Metrics**
*Disposable variant of product 4*

**Average of P4 Disposable Awareness**
- **Type**: Percentage (0-1 scale)
- **Description**: Awareness for disposable P4 variant
- **Range**: [0.656, 0.941]
- **Distribution**: Moderately left-skewed (Skewness: -0.706)
- **Central Tendency**: Mean=0.821, Median=0.853
- **Variability**: CV=10.6% (low variation)
- **Missing**: 22.1%
- **Analysis Value**: Category leadership indicator

**Average of P4 Disposable Trial**
- **Type**: Percentage (0-1 scale)
- **Description**: Trial rate for disposable P4 variant
- **Range**: [0.252, 0.659]
- **Distribution**: Nearly symmetric (Skewness: 0.486)
- **Central Tendency**: Mean=0.425, Median=0.426
- **Variability**: CV=27.9% (moderate variation)
- **Missing**: 22.1%
- **Analysis Value**: Product variant performance comparison

#### **P4 Closed Category Metrics**
*Closed/reusable variant of product 4*

**Average of P4 Closed Awareness**
- **Type**: Percentage (0-1 scale)
- **Description**: Awareness for closed/reusable P4 variant
- **Range**: [0.716, 0.925]
- **Distribution**: Highly left-skewed (Skewness: -1.385)
- **Central Tendency**: Mean=0.856, Median=0.869
- **Variability**: CV=6.8% (very low variation)
- **Missing**: 22.1%
- **Analysis Value**: Highest performing category, market maturity indicator

**Average of P4 Closed Trial**
- **Type**: Percentage (0-1 scale)
- **Description**: Trial rate for closed P4 variant
- **Range**: [0.303, 0.600]
- **Distribution**: Nearly symmetric (Skewness: 0.196)
- **Central Tendency**: Mean=0.454, Median=0.434
- **Variability**: CV=20.4% (moderate variation)
- **Missing**: 22.1%
- **Analysis Value**: Best-in-class conversion benchmark

**P4 Closed P7D & Growth**
- **Type**: Percentage (0-1 scale)
- **Description**: 7-day engagement and growth metrics
- **Missing**: 22.1%
- **Analysis Value**: Retention and lifecycle performance

#### **P5 Category Metrics**
*Product 5 performance indicators*

**Average of P5 Awareness**
- **Type**: Percentage (0-1 scale)
- **Description**: Brand/product awareness rate for P5
- **Range**: [0.425, 0.766]
- **Distribution**: Nearly symmetric (Skewness: -0.223)
- **Central Tendency**: Mean=0.602, Median=0.594
- **Variability**: CV=17.0% (moderate variation)
- **Missing**: 33.2% (highest missing rate)
- **Analysis Value**: Emerging category performance, growth potential

**Average of P5 Trial**
- **Type**: Percentage (0-1 scale)
- **Description**: Trial/purchase rate for P5
- **Range**: [0.085, 0.348]
- **Distribution**: Moderately right-skewed (Skewness: 0.512)
- **Central Tendency**: Mean=0.197, Median=0.165
- **Variability**: CV=43.4% (highest variation)
- **Missing**: 33.2%
- **Analysis Value**: Conversion challenge identification, optimization opportunity

**P5 P7D & Growth**
- **Type**: Percentage (0-1 scale)
- **Description**: Post-trial engagement metrics
- **Missing**: 33.2%
- **Analysis Value**: Category lifecycle assessment

---

## 4. Feature Quality Assessment

### Completeness Matrix
| Feature Group | Missing % | Data Quality | Usability |
|---------------|-----------|--------------|-----------|
| **Dimensions** | 0.3% | Excellent | Full |
| **Volume Metrics** | 0% | Excellent | Full |
| **P1 Metrics** | 22.1% | Good | High |
| **P4 Metrics** | 22.1% | Good | High |
| **P5 Metrics** | 33.2% | Moderate | Medium |

### Statistical Reliability
| Metric Category | Sample Size | Reliability | Confidence |
|-----------------|-------------|-------------|------------|
| **P1 Performance** | 6,141 | High | 95%+ |
| **P4 Performance** | 6,141 | High | 95%+ |
| **P5 Performance** | 5,267 | Moderate | 90%+ |
| **Volume Data** | 7,880 | Very High | 99%+ |

---

## 5. Feature Relationships & Dependencies

### Strong Correlations (r > 0.8)
```
Awareness → Trial Funnels:
├── P1: r = 0.914 (strongest)
├── P4 Disposable: r = 0.892
├── P5: r = 0.886
└── P4 Closed: r = 0.842

Product Category Synergies:
└── P4 Disposable ↔ P4 Closed: r = 0.912
```

### Independence Patterns
- **Volume metrics weakly correlated** with performance (r ≈ 0.004)
- **Cross-category awareness** shows limited correlation
- **Geographic effects** independent of product performance

---

## 6. Feature Engineering Potential

### Derived Features - High Value
1. **Conversion Rates**
   - `P1_Conversion = P1_Trial / P1_Awareness`
   - `P4_Disp_Conversion = P4_Disp_Trial / P4_Disp_Awareness`
   - Analysis Value: Direct efficiency measurement

2. **Performance Gaps**
   - `P1_Gap = P1_Awareness - P1_Trial`
   - Analysis Value: Opportunity quantification

3. **Category Performance Index**
   - `Overall_Index = weighted_avg(P1, P4_Disp, P4_Closed, P5)`
   - Analysis Value: Composite performance scoring

4. **Market Concentration**
   - `Airport_HHI = sum(PAX_Share^2)` by airport
   - Analysis Value: Competition analysis

### Derived Features - Medium Value
1. **Volume Tiers**
   - `PAX_Tier = quartile_rank(PAX_Mio)`
   - Analysis Value: Size-based segmentation

2. **Regional Performance Ranks**
   - `Region_Rank = rank(performance)` within region
   - Analysis Value: Relative positioning

3. **Product Portfolio Strength**
   - `Portfolio_Breadth = count(non_null_categories)`
   - Analysis Value: Market presence assessment

---

## 7. Feature Usage Recommendations

### Primary Analysis Features
**Essential for all analyses:**
- Region, Nationality (segmentation)
- PAX (Mio) (weighting)
- P1/P4/P5 Awareness & Trial (core KPIs)

### Secondary Analysis Features  
**Valuable for specific analyses:**
- Country, Airport Name (granular analysis)
- PAX Share (concentration studies)
- P7D, Growth metrics (lifecycle analysis)

### Feature Selection by Use Case

#### **Market Sizing Analysis**
- Primary: Region, Country, PAX (Mio), PAX Share
- Secondary: Airport Name, Nationality

#### **Performance Benchmarking**
- Primary: All Awareness & Trial metrics
- Secondary: P7D & Growth metrics
- Weighting: PAX (Mio)

#### **Conversion Optimization**
- Primary: Awareness/Trial pairs by category
- Derived: Conversion rates, performance gaps
- Segmentation: Region, Nationality

#### **Geographic Strategy**
- Primary: Region, Country, Performance metrics
- Secondary: Airport Name for hub analysis
- Weighting: PAX volume and share

---

## 8. Data Constraints & Limitations

### Temporal Constraints
- **No time dimension**: Cross-sectional snapshot only
- **Seasonality unknown**: May represent specific time period
- **Trend analysis impossible**: Cannot assess performance changes

### Sample Constraints
- **Top 10 nationalities only**: Long tail nationalities excluded
- **Airport selection criteria unknown**: May not represent full market
- **Response bias possible**: Survey-based metrics may have bias

### Measurement Constraints
- **Awareness/Trial definitions unclear**: Methodology not specified
- **Scale consistency unknown**: Cross-region comparability uncertain
- **Missing data patterns**: Systematic rather than random

---

## 9. Recommended Data Enhancements

### High Priority Additions
1. **Temporal Dimension**: Time series data for trend analysis
2. **Definition Documentation**: Clear metric definitions and methodology
3. **Sample Documentation**: Selection criteria and representativeness

### Medium Priority Additions
1. **Additional Demographics**: Age, income, travel purpose
2. **Competitive Context**: Market share vs. competitors
3. **External Factors**: Economic indicators, travel patterns

### Low Priority Additions
1. **Behavioral Data**: Usage patterns, preferences
2. **Satisfaction Metrics**: Customer experience indicators
3. **Channel Data**: Touchpoint and channel effectiveness

---

## 10. Technical Implementation Notes

### Data Types for Analysis
```python
CATEGORICAL_FEATURES = ['Region', 'Country', 'Airport Name', 'Nationality']
NUMERIC_FEATURES = ['PAX (Mio)', 'PAX Share']
PERCENTAGE_FEATURES = [
    'Average of P1 Awareness', 'Average of P1 Trial', 
    'Average of P4 Disposable Awareness', 'Average of P4 Disposable Trial',
    'Average of P4 Closed Awareness', 'Average of P4 Closed Trial',
    'Average of P5 Awareness', 'Average of P5 Trial'
]
```

### Missing Data Handling
- **Categorical**: No imputation needed (high completeness)
- **Performance Metrics**: Consider category-specific availability
- **Analysis Strategy**: Use available-case analysis or multiple imputation

### Scaling Considerations
- **Percentage features**: Already normalized (0-1 scale)
- **PAX volume**: Consider log transformation due to extreme skewness
- **Regional analysis**: Use population-weighted statistics

---

*Feature analysis based on 7,880 valid records with comprehensive statistical profiling and quality assessment.*