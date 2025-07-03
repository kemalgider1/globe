"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Globe from "react-globe.gl"
import { scaleSequentialSqrt } from "d3-scale"
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { useSalesData, getCountryValue, createTooltipContent } from "./dataProcessor"
import "./App.css"

function App() {
  const [countries, setCountries] = useState({ features: [] })
  const [hoverD, setHoverD] = useState()

  // Load sales data
  const { salesData, loading, error } = useSalesData("./datasets/data.csv")

  // Load GeoJSON data
  useEffect(() => {
    fetch("./datasets/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log("🌍 GeoJSON loaded. Features count:", data.features.length)
        setCountries(data)
      })
      .catch((error) => {
        console.error("❌ Error loading GeoJSON:", error)
      })
  }, [])

  // Get country value for visualization (now using PMI percentage)
  const getVal = useCallback(
    (feat) => {
      return getCountryValue(feat.properties, salesData, "pmiPercentage")
    },
    [salesData],
  )

  const colorScale = scaleSequentialSqrt(interpolateYlOrRd)

  const maxVal = useMemo(() => {
    if (!countries.features || countries.features.length === 0 || Object.keys(salesData).length === 0) {
      return 100 // Max percentage is 100%
    }

    const validValues = countries.features.map(getVal).filter((val) => val > 0 && !isNaN(val))

    if (validValues.length === 0) return 100

    const max = Math.max(...validValues)
    console.log("📊 Max PMI percentage:", max.toFixed(2) + "%")
    console.log("🌍 Countries with sales data:", validValues.length)

    return Math.min(max, 100) // Cap at 100%
  }, [countries, salesData, getVal])

  colorScale.domain([0, maxVal])

  const getCountryColor = (country) => {
    if (country === hoverD) {
      console.log("🎯 Hovered country:", country.properties.ADMIN || country.properties.NAME)
      return "steelblue"
    }

    const value = getVal(country)
    if (value <= 0) {
      return "#e0e0e0" // Light gray for no sales data
    }

    return colorScale(value)
  }

  const filteredCountries = countries.features.filter((d) => d.properties.ISO_A2 !== "AQ")

  if (loading) {
    return (
      <div
        className="App"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "white",
          fontSize: "18px",
        }}
      >
        Loading sales data...
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="App"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "red",
          fontSize: "18px",
        }}
      >
        Error loading data: {error.message}
      </div>
    )
  }

  return (
    <div className="App" style={{ position: "relative", width: "100vw", height: "100vh", background: "#000" }}>
      {/* Info Panel */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "12px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", color: "#4CAF50" }}>🌍 Global PMI Market Share</h3>
        <div style={{ marginBottom: "4px" }}>📊 Countries colored by PMI volume percentage</div>
        <div style={{ marginBottom: "4px" }}>🎯 PMI % = PMI Volume / Total Market Volume</div>
        <div style={{ marginBottom: "4px" }}>📈 Max PMI %: {maxVal.toFixed(2)}%</div>
        <div style={{ fontSize: "11px", opacity: 0.8 }}>💡 Hover over countries for detailed metrics</div>
      </div>

      {/* Globe */}
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={filteredCountries}
        polygonAltitude={0.01}
        polygonCapColor={getCountryColor}
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={({ properties }) => createTooltipContent(properties, salesData)}
        onPolygonHover={setHoverD}
        polygonsTransitionDuration={300}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Tooltip */}
      {hoverD && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
          }}
        >
          {createTooltipContent(hoverD.properties, salesData)}
        </div>
      )}
    </div>
  )
}

export default App
