"use client"

import { useEffect, useState } from "react"
import Papa from "papaparse"

export const processSalesData = (csvData) => {
  console.log("🔄 Processing sales data...")
  console.log("📊 Total records:", csvData.length)

  const marketData = {}
  let processedCount = 0

  // First pass: aggregate all data by DF_MARKET_NAME
  csvData.forEach((row) => {
    const marketName = row.DF_MARKET_NAME?.trim()
    const tmoName = row.TMO_NAME?.trim()
    const volume = Number.parseFloat(row.VOLUME) || 0
    const revenue = Number.parseFloat(row.USD_AMOUNT) || 0
    const location = row.LOCATION_NAME?.trim()

    if (!marketName || volume <= 0) return

    if (!marketData[marketName]) {
      marketData[marketName] = {
        totalVolume: 0,
        pmiVolume: 0,
        totalRevenue: 0,
        locations: new Set(),
        transactions: 0,
      }
    }

    marketData[marketName].totalVolume += volume
    marketData[marketName].totalRevenue += revenue
    marketData[marketName].transactions += 1

    // Track PMI volume specifically - check for various PMI identifiers
    if (
      tmoName === "PMI" ||
      tmoName === "PM INTERNATIONAL (OPERATING COMPANY)" ||
      tmoName?.includes("PMI") ||
      tmoName?.includes("PM INTERNATIONAL")
    ) {
      marketData[marketName].pmiVolume += volume
    }

    if (location) {
      marketData[marketName].locations.add(location)
    }

    processedCount++
  })

  // Second pass: calculate PMI percentage and prepare final data
  const processedData = {}

  Object.keys(marketData).forEach((market) => {
    const data = marketData[market]
    const pmiPercentage = data.totalVolume > 0 ? (data.pmiVolume / data.totalVolume) * 100 : 0

    processedData[market] = {
      totalVolume: data.totalVolume,
      pmiVolume: data.pmiVolume,
      pmiPercentage: pmiPercentage,
      totalRevenue: data.totalRevenue,
      locationCount: data.locations.size,
      transactions: data.transactions,
    }
  })

  const topMarkets = Object.entries(processedData)
    .sort((a, b) => b[1].pmiPercentage - a[1].pmiPercentage)
    .slice(0, 10)

  console.log("✅ Processing complete!")
  console.log("📈 Top 10 markets by PMI percentage:")
  topMarkets.forEach(([market, data], index) => {
    console.log(
      `  ${index + 1}. ${market}: ${data.pmiPercentage.toFixed(2)}% PMI (${data.totalVolume.toFixed(2)} total volume)`,
    )
  })

  return processedData
}

export const useSalesData = (csvPath = "./datasets/data.csv") => {
  const [salesData, setSalesData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("📂 Loading CSV data from:", csvPath)

        const response = await fetch(csvPath)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const csvText = await response.text()
        console.log("📄 CSV loaded:", (csvText.length / 1024 / 1024).toFixed(1), "MB")

        const parsed = Papa.parse(csvText, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
          transformHeader: (header) => header.replace(/"/g, "").trim(),
        })

        if (parsed.errors.length > 0) {
          console.warn("⚠️  CSV parsing warnings:", parsed.errors.slice(0, 5))
        }

        console.log("📊 CSV parsed:", {
          rows: parsed.data.length,
          columns: parsed.meta.fields?.length || 0,
          sampleFields: parsed.meta.fields?.slice(0, 10),
        })

        const processedData = processSalesData(parsed.data)
        setSalesData(processedData)
        setLoading(false)
      } catch (err) {
        console.error("❌ Error loading sales data:", err)
        setError(err)
        setLoading(false)
      }
    }

    loadData()
  }, [csvPath])

  return { salesData, loading, error }
}

// Comprehensive mapping from CSV market names to GeoJSON country names
const marketToCountryMapping = {
  // Direct matches
  "South Korea": ["South Korea", "Korea", "Republic of Korea"],
  "United Arab Emirates": ["United Arab Emirates", "UAE"],
  Japan: ["Japan"],
  Singapore: ["Singapore"],
  "Hong Kong": ["Hong Kong", "Hong Kong S.A.R."],
  Thailand: ["Thailand"],
  Malaysia: ["Malaysia"],
  Philippines: ["Philippines"],
  Indonesia: ["Indonesia"],
  Taiwan: ["Taiwan", "Chinese Taipei"],
  China: ["China", "People's Republic of China"],
  India: ["India"],
  Australia: ["Australia"],
  "New Zealand": ["New Zealand"],
  Vietnam: ["Vietnam", "Viet Nam"],
  Cambodia: ["Cambodia"],
  Myanmar: ["Myanmar", "Burma"],
  Laos: ["Laos", "Lao PDR"],
  Brunei: ["Brunei", "Brunei Darussalam"],
  "Saudi Arabia": ["Saudi Arabia"],
  Kuwait: ["Kuwait"],
  Qatar: ["Qatar"],
  Bahrain: ["Bahrain"],
  Oman: ["Oman"],
  Jordan: ["Jordan"],
  Lebanon: ["Lebanon"],
  Egypt: ["Egypt"],
  Turkey: ["Turkey"],
  Iran: ["Iran"],
  Iraq: ["Iraq"],
  Pakistan: ["Pakistan"],
  Bangladesh: ["Bangladesh"],
  "Sri Lanka": ["Sri Lanka"],
  Nepal: ["Nepal"],
  Maldives: ["Maldives"],
  Afghanistan: ["Afghanistan"],
  Kazakhstan: ["Kazakhstan"],
  Uzbekistan: ["Uzbekistan"],
  Kyrgyzstan: ["Kyrgyzstan"],
  Tajikistan: ["Tajikistan"],
  Turkmenistan: ["Turkmenistan"],
  Mongolia: ["Mongolia"],
}

export const getCountryValue = (countryProperties, salesData, metric = "pmiPercentage") => {
  // Try different property names that might contain the country name
  const countryName =
    countryProperties.NAME ||
    countryProperties.ADMIN ||
    countryProperties.NAME_EN ||
    countryProperties.COUNTRY ||
    countryProperties.name

  console.log("🔍 Looking for country:", countryName)

  // Try direct match first
  let data = salesData[countryName]

  // If no direct match, try the comprehensive mapping
  if (!data) {
    for (const [marketName, countryVariants] of Object.entries(marketToCountryMapping)) {
      if (
        countryVariants.some(
          (variant) =>
            variant.toLowerCase() === countryName?.toLowerCase() ||
            countryName?.toLowerCase().includes(variant.toLowerCase()) ||
            variant.toLowerCase().includes(countryName?.toLowerCase()),
        )
      ) {
        data = salesData[marketName]
        if (data) {
          console.log("✅ Found mapped data for:", countryName, "->", marketName)
          break
        }
      }
    }
  }

  if (!data) {
    console.log("❌ No data found for:", countryName)
    return 0
  }

  switch (metric) {
    case "pmiPercentage":
      return data.pmiPercentage || 0
    case "volume":
      return data.totalVolume || 0
    case "revenue":
      return data.totalRevenue || 0
    case "transactions":
      return data.transactions || 0
    case "locations":
      return data.locationCount || 0
    default:
      return data.pmiPercentage || 0
  }
}

export const createTooltipContent = (countryProperties, salesData) => {
  const countryName =
    countryProperties.NAME ||
    countryProperties.ADMIN ||
    countryProperties.NAME_EN ||
    countryProperties.COUNTRY ||
    countryProperties.name

  const countryCode = countryProperties.ISO_A2 || countryProperties.iso_a2

  // Try direct match first
  let data = salesData[countryName]
  let marketName = countryName

  // If no direct match, try the comprehensive mapping
  if (!data) {
    for (const [csvMarketName, countryVariants] of Object.entries(marketToCountryMapping)) {
      if (
        countryVariants.some(
          (variant) =>
            variant.toLowerCase() === countryName?.toLowerCase() ||
            countryName?.toLowerCase().includes(variant.toLowerCase()) ||
            variant.toLowerCase().includes(countryName?.toLowerCase()),
        )
      ) {
        data = salesData[csvMarketName]
        if (data) {
          marketName = csvMarketName
          break
        }
      }
    }
  }

  if (!data) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "12px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div>
          <b>
            {countryName} {countryCode && `(${countryCode})`}
          </b>
        </div>
        <div style={{ color: "#ccc" }}>No sales data available</div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "8px",
        borderRadius: "4px",
        fontSize: "12px",
        border: "1px solid rgba(255,255,255,0.2)",
        maxWidth: "250px",
      }}
    >
      <div>
        <b>
          {countryName} {countryCode && `(${countryCode})`}
        </b>
      </div>
      {marketName !== countryName && <div style={{ color: "#888", fontSize: "10px" }}>Market: {marketName}</div>}
      <div>
        🎯 PMI Percentage:{" "}
        <span style={{ color: "#4CAF50", fontWeight: "bold" }}>{data.pmiPercentage.toFixed(2)}%</span>
      </div>
      <div>
        📊 Total Volume: <span style={{ color: "#2196F3" }}>{data.totalVolume.toLocaleString()}</span>
      </div>
      <div>
        🏭 PMI Volume: <span style={{ color: "#FF9800" }}>{data.pmiVolume.toLocaleString()}</span>
      </div>
      <div>
        💰 Revenue: <span style={{ color: "#E91E63" }}>${data.totalRevenue.toLocaleString()}</span>
      </div>
      <div>
        📍 Locations: <span style={{ color: "#9C27B0" }}>{data.locationCount}</span>
      </div>
      <div>
        🔢 Transactions: <span style={{ color: "#607D8B" }}>{data.transactions}</span>
      </div>
    </div>
  )
}
