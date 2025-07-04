import React from 'react';
import './Dashboard.css';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaEquals, FaGlobe, FaChartLine, FaPercentage } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const chartFont = {
  family: 'Inter, Segoe UI, Arial, sans-serif',
  size: 13,
  weight: 500,
  color: '#e0e0ff'
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(30,30,40,0.95)',
      borderColor: '#fff',
      borderWidth: 1,
      titleFont: { ...chartFont, size: 14, weight: 700 },
      bodyFont: chartFont,
      padding: 10,
      caretSize: 6,
      cornerRadius: 6
    }
  },
  animation: {
    duration: 900,
    easing: 'easeOutQuart'
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { ...chartFont, color: '#b0b0d0', maxRotation: 0, minRotation: 0 }
    },
    y: {
      grid: { color: 'rgba(200,200,255,0.08)' },
      ticks: { ...chartFont, color: '#b0b0d0', stepSize: 500000 }
    }
  },
  borderRadius: 8,
  hover: { mode: 'index', intersect: false }
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { ...chartFont, color: '#e0e0ff', boxWidth: 18, borderRadius: 8 }
    },
    tooltip: {
      backgroundColor: 'rgba(30,30,40,0.95)',
      borderColor: '#fff',
      borderWidth: 1,
      titleFont: { ...chartFont, size: 14, weight: 700 },
      bodyFont: chartFont,
      padding: 10,
      caretSize: 6,
      cornerRadius: 6
    }
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 900,
    easing: 'easeOutQuart'
  }
};

const donutOptions = {
  responsive: true,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(30,30,40,0.95)',
      borderColor: '#fff',
      borderWidth: 1,
      titleFont: { ...chartFont, size: 14, weight: 700 },
      bodyFont: chartFont,
      padding: 10,
      caretSize: 6,
      cornerRadius: 6
    }
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 900,
    easing: 'easeOutQuart'
  }
};

const lineOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(30,30,40,0.95)',
      borderColor: '#fff',
      borderWidth: 1,
      titleFont: { ...chartFont, size: 14, weight: 700 },
      bodyFont: chartFont,
      padding: 10,
      caretSize: 6,
      cornerRadius: 6
    }
  },
  animation: {
    duration: 900,
    easing: 'easeOutQuart'
  },
  scales: {
    x: {
      grid: { color: 'rgba(200,200,255,0.08)' },
      ticks: { ...chartFont, color: '#b0b0d0' }
    },
    y: {
      grid: { color: 'rgba(200,200,255,0.08)' },
      ticks: { ...chartFont, color: '#b0b0d0' }
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: '#00ffe7',
      borderColor: '#fff',
      borderWidth: 2
    },
    line: {
      borderWidth: 3,
      borderColor: '#00ffe7',
      backgroundColor: 'rgba(0,255,231,0.1)',
      tension: 0.4
    }
  }
};

function getTrendIcon(growth) {
  if (growth > 0.5) return <FaArrowUp style={{ color: '#00ffe7', marginLeft: 6, fontSize: 16, verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px #00ffe7)' }} title="Growth" />;
  if (growth < -0.5) return <FaArrowDown style={{ color: '#ff3b3b', marginLeft: 6, fontSize: 16, verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px #ff3b3b)' }} title="Decline" />;
  return <FaEquals style={{ color: '#ffe700', marginLeft: 6, fontSize: 16, verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px #ffe700)' }} title="Stable" />;
}

function Dashboard({
  data,
  selectedCountry,
  onBackToGlobal
}) {
  if (!data) return null;

  // Global metrics
  const total2024 = data.total2024 || 0;
  const total2023 = data.total2023 || 0;
  const avgPmi = data.avgPmi || 0;
  const countriesWithData = data.countriesWithData || 0;
  const top5 = data.top5 || [];
  const aboveAvg = data.aboveAvg || 0;
  const belowAvg = data.belowAvg || 0;

  // Growth rate and trend
  const growth = total2023 > 0 ? ((total2024 - total2023) / total2023) * 100 : 0;
  const growthIcon = getTrendIcon(growth);
  const growthColor = growth > 0.5 ? '#00ffe7' : (growth < -0.5 ? '#ff3b3b' : '#ffe700');

  // Volatility (std dev of PMI %)
  const volatility = data.pmiStdDev ? data.pmiStdDev.toFixed(2) : '—';

  // Market share donut (top 5 vs rest)
  const top5Sum = top5.reduce((sum, c) => sum + c.volume, 0);
  const restSum = total2024 - top5Sum;
  const donutData = {
    labels: ['Top 5', 'Rest'],
    datasets: [
      {
        data: [top5Sum, restSum],
        backgroundColor: [
          'rgba(0,255,231,0.85)',
          'rgba(60,60,80,0.45)'
        ],
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.12)',
        hoverOffset: 8
      }
    ]
  };

  // Bar chart for top 5 countries
  const barData = {
    labels: top5.map(c => c.name),
    datasets: [
      {
        label: '2024 Volume',
        data: top5.map(c => c.volume),
        backgroundColor: [
          'rgba(102, 189, 99, 0.85)',
          'rgba(102, 189, 99, 0.75)',
          'rgba(102, 189, 99, 0.65)',
          'rgba(102, 189, 99, 0.55)',
          'rgba(102, 189, 99, 0.45)'
        ],
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(102, 189, 99, 1)'
      }
    ]
  };

  // Pie chart for above/below average
  const pieData = {
    labels: ['Above Avg PMI', 'Below Avg PMI'],
    datasets: [
      {
        data: [aboveAvg, belowAvg],
        backgroundColor: [
          'rgba(102, 189, 99, 0.85)',
          'rgba(215, 48, 39, 0.75)'
        ],
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.12)',
        hoverOffset: 8
      }
    ]
  };

  // Heatmap legend for PMI %
  const heatmapColors = [
    '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'
  ];
  const heatmapLabels = ['< Avg -21%', '-14%', '-7%', 'Avg', '+7%', '+14%', '+21%', '> Avg +28%'];

  // Country-specific data
  if (selectedCountry) {
    const countryName = selectedCountry.properties.ADMIN || selectedCountry.properties.NAME;
    const volume2024 = Number(selectedCountry.properties.volume_2024) || 0;
    const volume2023 = Number(selectedCountry.properties.volume_2023) || 0;
    const pmiPercentage = selectedCountry.properties.pmi_percentage || 0;
    const pmiVolume2024 = Number(selectedCountry.properties.pmi_volume_2024) || 0;
    const pmiVolume2023 = Number(selectedCountry.properties.pmi_volume_2023) || 0;

    // Country growth calculations
    const countryGrowth = volume2023 > 0 ? ((volume2024 - volume2023) / volume2023) * 100 : 0;
    const countryGrowthIcon = getTrendIcon(countryGrowth);
    const countryGrowthColor = countryGrowth > 0.5 ? '#00ffe7' : (countryGrowth < -0.5 ? '#ff3b3b' : '#ffe700');

    // PMI growth
    const pmiGrowth = pmiVolume2023 > 0 ? ((pmiVolume2024 - pmiVolume2023) / pmiVolume2023) * 100 : 0;
    const pmiGrowthIcon = getTrendIcon(pmiGrowth);
    const pmiGrowthColor = pmiGrowth > 0.5 ? '#00ffe7' : (pmiGrowth < -0.5 ? '#ff3b3b' : '#ffe700');

    // Market share calculation
    const marketShare = total2024 > 0 ? (volume2024 / total2024) * 100 : 0;
    const marketShareRank = top5.findIndex(c => c.name === countryName) + 1;

    // PMI vs Global Average
    const pmiVsGlobal = pmiPercentage - avgPmi;
    const pmiVsGlobalIcon = pmiVsGlobal > 0 ? 
      <FaArrowUp style={{ color: '#00ffe7', marginLeft: 6, fontSize: 16, verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px #00ffe7)' }} title="Above Global Avg" /> :
      <FaArrowDown style={{ color: '#ff3b3b', marginLeft: 6, fontSize: 16, verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px #ff3b3b)' }} title="Below Global Avg" />;

    // Volume trend line chart (2023-2024)
    const volumeTrendData = {
      labels: ['2023', '2024'],
      datasets: [
        {
          label: 'Total Volume',
          data: [volume2023, volume2024],
          borderColor: '#00ffe7',
          backgroundColor: 'rgba(0,255,231,0.1)',
          tension: 0.4
        },
        {
          label: 'PMI Volume',
          data: [pmiVolume2023, pmiVolume2024],
          borderColor: '#66bd63',
          backgroundColor: 'rgba(102,189,99,0.1)',
          tension: 0.4
        }
      ]
    };

    // PMI composition pie chart
    const pmiCompositionData = {
      labels: ['PMI Volume', 'Non-PMI Volume'],
      datasets: [
        {
          data: [pmiVolume2024, volume2024 - pmiVolume2024],
          backgroundColor: [
            'rgba(102, 189, 99, 0.85)',
            'rgba(60, 60, 80, 0.45)'
          ],
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.12)',
          hoverOffset: 8
        }
      ]
    };

    // Regional comparison (simulated data)
    const regionalComparisonData = {
      labels: [countryName, 'Regional Avg', 'Global Avg'],
      datasets: [
        {
          label: 'PMI %',
          data: [pmiPercentage, avgPmi * 0.9, avgPmi],
          backgroundColor: [
            'rgba(0,255,231,0.85)',
            'rgba(255,235,0,0.75)',
            'rgba(60,60,80,0.45)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };

    return (
      <div className="dashboard-glass country-view">
        <button className="dashboard-back" onClick={onBackToGlobal}>
          <FaGlobe style={{ marginRight: 8 }} />
          Back to Global
        </button>
        <h2>{countryName}</h2>
        
        <div className="dashboard-metrics">
          <div className="metric">
            <span className="metric-label">2024 Volume</span>
            <span className="metric-value">
              {volume2024.toLocaleString()}
              <span style={{ marginLeft: 8, color: countryGrowthColor, fontWeight: 700 }}>
                {countryGrowthIcon}
                <span style={{ fontSize: 13, marginLeft: 2 }}>{Math.abs(countryGrowth).toFixed(1)}%</span>
              </span>
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">2023 Volume</span>
            <span className="metric-value">{volume2023.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="metric-label">PMI % (2024)</span>
            <span className="metric-value">
              {pmiPercentage.toFixed(2)}%
              {pmiVsGlobalIcon}
              <span style={{ fontSize: 13, marginLeft: 2, color: pmiVsGlobal > 0 ? '#00ffe7' : '#ff3b3b' }}>
                {Math.abs(pmiVsGlobal).toFixed(2)}%
              </span>
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">PMI Volume (2024)</span>
            <span className="metric-value">
              {pmiVolume2024.toLocaleString()}
              <span style={{ marginLeft: 8, color: pmiGrowthColor, fontWeight: 700 }}>
                {pmiGrowthIcon}
                <span style={{ fontSize: 13, marginLeft: 2 }}>{Math.abs(pmiGrowth).toFixed(1)}%</span>
              </span>
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Market Share</span>
            <span className="metric-value">
              {marketShare.toFixed(2)}%
              {marketShareRank > 0 && <span style={{ fontSize: 13, marginLeft: 4, color: '#00ffe7' }}>#{marketShareRank}</span>}
            </span>
          </div>
        </div>

        <div className="dashboard-charts">
          <div className="chart-block">
            <h4><FaChartLine style={{ marginRight: 8 }} />Volume Trend (2023-2024)</h4>
            <Line data={volumeTrendData} options={lineOptions} height={120} />
          </div>
          <div className="chart-block">
            <h4><FaPercentage style={{ marginRight: 8 }} />PMI Composition</h4>
            <Pie data={pmiCompositionData} options={pieOptions} />
          </div>
          <div className="chart-block">
            <h4>Regional PMI Comparison</h4>
            <Bar data={regionalComparisonData} options={barOptions} height={120} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-glass global-view">
      <h2>🌐 Global Insights</h2>
      <div className="dashboard-metrics">
        <div className="metric">
          <span className="metric-label">Total 2024 Volume</span>
          <span className="metric-value">
            {total2024.toLocaleString()}
            <span style={{ marginLeft: 8, color: growthColor, fontWeight: 700 }}>
              {growthIcon}
              <span style={{ fontSize: 13, marginLeft: 2 }}>{Math.abs(growth).toFixed(1)}%</span>
            </span>
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Total 2023 Volume</span>
          <span className="metric-value">{total2023.toLocaleString()}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Avg PMI %</span>
          <span className="metric-value">{avgPmi.toFixed(2)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Countries with Data</span>
          <span className="metric-value">{countriesWithData}</span>
        </div>
        <div className="metric">
          <span className="metric-label">PMI Volatility</span>
          <span className="metric-value">{volatility}</span>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="chart-block">
          <h4>Market Share (Top 5 vs Rest)</h4>
          <Doughnut data={donutData} options={donutOptions} height={120} />
        </div>
        <div className="chart-block">
          <h4>Top 5 Countries by 2024 Volume</h4>
          <Bar data={barData} options={barOptions} height={120} />
        </div>
        <div className="chart-block">
          <h4>PMI % Distribution</h4>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div className="chart-block heatmap-legend-block">
          <h4>PMI % Heatmap Legend</h4>
          <div className="heatmap-legend">
            {heatmapColors.map((color, i) => (
              <div key={i} className="heatmap-legend-color" style={{ background: color }} title={heatmapLabels[i]}></div>
            ))}
          </div>
          <div className="heatmap-legend-labels">
            {heatmapLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 