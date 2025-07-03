// Debug script to help identify country matching issues
// Run this in your browser console to see available countries

export const debugCountryMatching = (salesData, countries) => {
  console.log("🔍 DEBUGGING COUNTRY MATCHING")
  console.log("=".repeat(50))

  console.log("📊 Available markets in sales data:")
  Object.keys(salesData).forEach((market, index) => {
    console.log(`  ${index + 1}. ${market} (PMI: ${salesData[market].pmiPercentage.toFixed(2)}%)`)
  })

  console.log("\n🌍 Available countries in GeoJSON:")
  countries.features.slice(0, 20).forEach((country, index) => {
    const name = country.properties.NAME || country.properties.ADMIN
    const code = country.properties.ISO_A2
    console.log(`  ${index + 1}. ${name} (${code})`)
  })

  console.log("\n🔗 Successful matches:")
  let matchCount = 0
  countries.features.forEach((country) => {
    const countryName = country.properties.NAME || country.properties.ADMIN
    // Check if this country has data
    let hasData = false

    // Direct match
    if (salesData[countryName]) {
      hasData = true
    } else {
      // Check mapping
      for (const [marketName, countryVariants] of Object.entries(marketToCountryMapping)) {
        if (
          countryVariants.some(
            (variant) =>
              variant.toLowerCase() === countryName?.toLowerCase() ||
              countryName?.toLowerCase().includes(variant.toLowerCase()) ||
              variant.toLowerCase().includes(countryName?.toLowerCase()),
          )
        ) {
          if (salesData[marketName]) {
            hasData = true
            break
          }
        }
      }
    }

    if (hasData) {
      matchCount++
      console.log(`  ✅ ${countryName}`)
    }
  })

  console.log(`\n📈 Total matches: ${matchCount} out of ${countries.features.length} countries`)
  console.log(`📊 Sales data coverage: ${Object.keys(salesData).length} markets`)
}

// Add this to your marketToCountryMapping - expanded version
const marketToCountryMapping = {
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
  "Saudi Arabia": ["Saudi Arabia"],
}