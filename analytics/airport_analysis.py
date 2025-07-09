import pandas as pd
import json
import numpy as np


def create_final_airport_files():
    """
    Create final airport files compatible with the existing React Globe setup
    """

    data_directory = "/Users/kemalgider/Desktop/globe/react-globe-app/public/datasets"
    df_macase_file = f"{data_directory}/df_macase.csv"
    geo_file = f"{data_directory}/GEO_DIM_TOUCH_POINT.csv"

    print("CREATING FINAL AIRPORT FILES - REACT GLOBE COMPATIBLE")
    print("=" * 60)

    # Load datasets
    print("Loading datasets...")
    df_macase = pd.read_csv(df_macase_file)
    geo_data = pd.read_csv(geo_file)

    print(f"✓ DF-MACASE: {len(df_macase):,} airports")
    print(f"✓ GEO data: {len(geo_data):,} touch points")

    # Filter geo data for airports with valid coordinates
    geo_airports = geo_data[
        (geo_data['TRADE_CHANNEL_CODE'] == 'AI') &
        (geo_data['GEO_COORD_LATITUDE'].notna()) &
        (geo_data['GEO_COORD_LONGITUDE'].notna()) &
        (geo_data['GEO_COORD_LATITUDE'] != 0) &
        (geo_data['GEO_COORD_LONGITUDE'] != 0) &
        (geo_data['IATA_CODE'].notna())
        ].copy()

    # Remove duplicates
    geo_coords = geo_airports.drop_duplicates(subset=['IATA_CODE'], keep='first')[
        ['IATA_CODE', 'GEO_COORD_LATITUDE', 'GEO_COORD_LONGITUDE']
    ]

    print(f"✓ Valid airport coordinates: {len(geo_coords):,}")

    # Manual coordinates for the 5 missing high-value airports
    missing_coords = {
        'RUH': (24.9576, 46.6983),  # King Khalid Intl, Riyadh - $1,182/PAX
        'DMM': (26.4712, 49.7979),  # King Fahd Intl, Dammam - $438/PAX
        'MED': (24.5534, 39.7051),  # Prince Mohammad, Medina - $628/PAX
        'ILO': (10.8133, 122.4925),  # Iloilo Intl, Philippines - $37/PAX
        'KLO': (11.6793, 122.3761)  # Kalibo Intl, Philippines - $471/PAX
    }

    print(f"✓ Adding {len(missing_coords)} missing high-value airports")

    # Add missing coordinates to geo_coords
    for iata_code, (lat, lon) in missing_coords.items():
        new_row = pd.DataFrame({
            'IATA_CODE': [iata_code],
            'GEO_COORD_LATITUDE': [lat],
            'GEO_COORD_LONGITUDE': [lon]
        })
        geo_coords = pd.concat([geo_coords, new_row], ignore_index=True)

    # Merge with DF-MACASE data
    print("Merging datasets...")
    merged_data = df_macase.merge(geo_coords, on='IATA_CODE', how='left')

    # Check results
    total_airports = len(merged_data)
    with_coords = len(merged_data[merged_data['GEO_COORD_LATITUDE'].notna()])
    without_coords = total_airports - with_coords

    print(f"✓ Merge completed:")
    print(f"  Total airports: {total_airports:,}")
    print(f"  With coordinates: {with_coords:,} ({with_coords / total_airports * 100:.1f}%)")
    print(f"  Without coordinates: {without_coords:,} ({without_coords / total_airports * 100:.1f}%)")

    # Verify the fixed airports
    print(f"\nVerifying fixed airports:")
    for iata_code in missing_coords.keys():
        airport = merged_data[merged_data['IATA_CODE'] == iata_code].iloc[0]
        print(f"✓ {iata_code}: {airport['AIRPORT_NAME']}")
        print(f"  Coordinates: ({airport['GEO_COORD_LATITUDE']:.4f}, {airport['GEO_COORD_LONGITUDE']:.4f})")
        print(f"  PAX: {airport['PAX']:,.0f}, PMI Spend/PAX: ${airport['$/PAX tob. spend - PMI']:,.4f}")

    # Save enhanced CSV
    csv_output = f"{data_directory}/airport_analysis_final.csv"
    merged_data.to_csv(csv_output, index=False)
    print(f"\n✓ Enhanced CSV saved: {csv_output}")

    # Create GeoJSON compatible with React Globe points layer
    print("Creating GeoJSON for React Globe points layer...")

    # Filter to airports with coordinates
    viz_data = merged_data[
        (merged_data['GEO_COORD_LATITUDE'].notna()) &
        (merged_data['GEO_COORD_LONGITUDE'].notna())
        ].copy()

    print(f"✓ Airports for visualization: {len(viz_data):,}")

    # Create points data structure compatible with react-globe.gl
    points_data = []

    for idx, row in viz_data.iterrows():
        # Clean and validate data
        pax = float(row['PAX']) if pd.notna(row['PAX']) else 0
        spend_per_pax = float(row['$/PAX tob. spend - PMI']) if pd.notna(row['$/PAX tob. spend - PMI']) else 0
        pmi_profit = float(row['PMI profit%']) if pd.notna(row['PMI profit%']) else 0
        prevalence = float(row['% Prevalence']) if pd.notna(row['% Prevalence']) else 0

        # Determine size category for visualization
        if pax > 200000:
            size = 0.8
            size_category = "large"
        elif pax > 50000:
            size = 0.6
            size_category = "medium"
        elif pax > 10000:
            size = 0.4
            size_category = "small"
        else:
            size = 0.2
            size_category = "tiny"

        # Color based on PMI performance
        if pmi_profit > 0.5:
            color = '#ff4444'  # High PMI performance - red
        elif pmi_profit > 0.1:
            color = '#ff8844'  # Medium PMI performance - orange
        elif pmi_profit > 0:
            color = '#ffdd44'  # Low PMI performance - yellow
        else:
            color = '#888888'  # No PMI data - gray

        # Check if nationality mismatch (hub airport)
        is_hub = row['COUNTRY_NAME'] != row['NATIONALITY'] if pd.notna(row['NATIONALITY']) else False

        point = {
            "lat": float(row['GEO_COORD_LATITUDE']),
            "lng": float(row['GEO_COORD_LONGITUDE']),
            "size": size,
            "color": color,
            "iata_code": str(row['IATA_CODE']),
            "airport_name": str(row['AIRPORT_NAME']),
            "country": str(row['COUNTRY_NAME']),
            "nationality": str(row['NATIONALITY']) if pd.notna(row['NATIONALITY']) else 'Unknown',
            "pax": pax,
            "spend_per_pax": spend_per_pax,
            "pmi_profit_pct": pmi_profit * 100,  # Convert to percentage
            "prevalence_pct": prevalence * 100,  # Convert to percentage
            "size_category": size_category,
            "is_hub_airport": is_hub,
            "altitude": 0.01 + (size * 0.02)  # Altitude based on size
        }
        points_data.append(point)

    # Save points data as JSON (compatible with react-globe.gl pointsData)
    points_output = f"{data_directory}/airports_points.json"
    with open(points_output, 'w') as f:
        json.dump(points_data, f, indent=2)

    print(f"✓ Points JSON saved: {points_output}")

    # Also create traditional GeoJSON for compatibility
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    for point in points_data:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [point["lng"], point["lat"]]
            },
            "properties": {
                k: v for k, v in point.items() if k not in ["lat", "lng"]
            }
        }
        geojson["features"].append(feature)

    # Save traditional GeoJSON
    geojson_output = f"{data_directory}/airports_analysis.geojson"
    with open(geojson_output, 'w') as f:
        json.dump(geojson, f, indent=2)

    print(f"✓ GeoJSON saved: {geojson_output}")

    # Create React component code snippet for integration
    react_code = '''
// Add this to your App.js imports
import airportsData from './datasets/airports_points.json';

// Add this to your Globe component props (inside the <Globe> tag):
pointsData={airportsData}
pointLat={d => d.lat}
pointLng={d => d.lng}
pointAltitude={d => d.altitude}
pointRadius={d => d.size}
pointColor={d => d.color}
pointLabel={d => `
  <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px;">
    <div><b>${d.airport_name} (${d.iata_code})</b></div>
    <div>Country: ${d.country}</div>
    <div>Nationality: ${d.nationality}</div>
    <div>PAX: ${d.pax.toLocaleString()}</div>
    <div>PMI Spend/PAX: ${d.spend_per_pax.toFixed(2)}</div>
    <div>PMI Profit: ${d.pmi_profit_pct.toFixed(1)}%</div>
    ${d.is_hub_airport ? '<div style="color: #ffdd44;">🌐 Hub Airport</div>' : ''}
  </div>
`}
onPointClick={d => {
  console.log('Airport clicked:', d);
  // Add your click handler here
}}
'''

    # Save React integration code
    react_output = f"{data_directory}/react_integration.txt"
    with open(react_output, 'w') as f:
        f.write(react_code)

    print(f"✓ React integration code: {react_output}")

    # Create summary statistics
    print(f"\n" + "=" * 60)
    print("FINAL DATASET SUMMARY - REACT GLOBE READY")
    print("=" * 60)

    # Overall stats
    total_pax = sum(p['pax'] for p in points_data)
    airports_with_pmi = len([p for p in points_data if p['pmi_profit_pct'] > 0])
    avg_pmi_spend = np.mean([p['spend_per_pax'] for p in points_data if p['spend_per_pax'] > 0])
    hub_airports = len([p for p in points_data if p['is_hub_airport']])

    print(f"Total airports with coordinates: {len(points_data):,}")
    print(f"Total PAX volume: {total_pax:,.0f}")
    print(f"Airports with PMI data: {airports_with_pmi:,} ({airports_with_pmi / len(points_data) * 100:.1f}%)")
    print(f"Average PMI spend/PAX: ${avg_pmi_spend:.2f}")
    print(f"Hub airports: {hub_airports:,} ({hub_airports / len(points_data) * 100:.1f}%)")

    # Size distribution
    size_dist = {}
    for point in points_data:
        cat = point['size_category']
        size_dist[cat] = size_dist.get(cat, 0) + 1

    print(f"\nAirport size distribution:")
    for size_cat, count in sorted(size_dist.items()):
        print(f"  {size_cat.title()}: {count:,}")

    # Top performers
    print(f"\nTop 5 airports by PAX volume:")
    top_pax = sorted(points_data, key=lambda x: x['pax'], reverse=True)[:5]
    for i, airport in enumerate(top_pax, 1):
        print(f"  {i}. {airport['iata_code']}: {airport['airport_name']} - {airport['pax']:,.0f} PAX")

    print(f"\nTop 5 airports by PMI spend/PAX:")
    top_pmi = sorted([p for p in points_data if p['spend_per_pax'] > 0],
                     key=lambda x: x['spend_per_pax'], reverse=True)[:5]
    for i, airport in enumerate(top_pmi, 1):
        print(f"  {i}. {airport['iata_code']}: {airport['airport_name']} - ${airport['spend_per_pax']:,.2f}/PAX")

    print(f"\n✅ FILES READY FOR REACT GLOBE")
    print(f"📁 CSV: airport_analysis_final.csv")
    print(f"🎯 Points JSON: airports_points.json (use this in React)")
    print(f"🌍 GeoJSON: airports_analysis.geojson (backup format)")
    print(f"⚛️  Integration code: react_integration.txt")

    return merged_data, points_data, geojson


if __name__ == "__main__":
    merged_data, points_data, geojson_data = create_final_airport_files()