import pandas as pd
import json
import numpy as np


def create_final_airport_files():
    """
    Create final airport files with all coordinates fixed for the 5 missing high-value airports
    """

    data_directory = "/Users/kemalgider/Desktop/globe/react-globe-app/public/datasets"
    df_macase_file = f"{data_directory}/df_macase.csv"
    geo_file = f"{data_directory}/GEO_DIM_TOUCH_POINT.csv"

    print("CREATING FINAL AIRPORT FILES WITH FIXED COORDINATES")
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

    # Create GeoJSON for visualization
    print("Creating GeoJSON for React Globe...")

    # Filter to airports with coordinates and PMI data
    viz_data = merged_data[
        (merged_data['GEO_COORD_LATITUDE'].notna()) &
        (merged_data['GEO_COORD_LONGITUDE'].notna())
        ].copy()

    print(f"✓ Airports for visualization: {len(viz_data):,}")

    # Create GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "properties": {
            "name": "PMI Airport Analysis",
            "description": "Airport analysis with passenger volumes and PMI metrics",
            "total_airports": len(viz_data),
            "total_pax": float(viz_data['PAX'].sum()),
            "airports_with_pmi_data": len(viz_data[viz_data['PMI profit%'] > 0])
        },
        "features": []
    }

    # Add features for each airport
    for idx, row in viz_data.iterrows():
        # Determine airport size category for visualization
        pax = row['PAX']
        if pax > 200000:
            size_category = "large"
        elif pax > 50000:
            size_category = "medium"
        elif pax > 10000:
            size_category = "small"
        else:
            size_category = "tiny"

        # Determine PMI performance category
        pmi_profit = row['PMI profit%']
        if pmi_profit > 0.5:
            pmi_category = "high"
        elif pmi_profit > 0.1:
            pmi_category = "medium"
        elif pmi_profit > 0:
            pmi_category = "low"
        else:
            pmi_category = "none"

        # Check if nationality mismatch (hub airport)
        is_hub = row['COUNTRY_NAME'] != row['NATIONALITY']

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(row['GEO_COORD_LONGITUDE']), float(row['GEO_COORD_LATITUDE'])]
            },
            "properties": {
                "iata_code": row['IATA_CODE'],
                "airport_name": row['AIRPORT_NAME'],
                "country": row['COUNTRY_NAME'],
                "nationality": row['NATIONALITY'],
                "df_location": row['DF_LOCATION'],
                "pax": float(row['PAX']) if pd.notna(row['PAX']) else 0,
                "spend_per_pax": float(row['$/PAX tob. spend - PMI']) if pd.notna(row['$/PAX tob. spend - PMI']) else 0,
                "pmi_profit_pct": float(row['PMI profit%']) if pd.notna(row['PMI profit%']) else 0,
                "cot_cc_pct": float(row['% of COT, CC']) if pd.notna(row['% of COT, CC']) else 0,
                "prevalence_pct": float(row['% Prevalence']) if pd.notna(row['% Prevalence']) else 0,
                "pmi_sob_pct": float(row['PMI SoB %']) if pd.notna(row['PMI SoB %']) else 0,
                "nat_pct_ct": float(row['Nat. % of CT']) if pd.notna(row['Nat. % of CT']) else 0,
                "size_category": size_category,
                "pmi_category": pmi_category,
                "is_hub_airport": is_hub
            }
        }
        geojson["features"].append(feature)

    # Save GeoJSON
    geojson_output = f"{data_directory}/airports_pmi_analysis.geojson"
    with open(geojson_output, 'w') as f:
        json.dump(geojson, f, indent=2)

    print(f"✓ GeoJSON saved: {geojson_output}")

    # Create summary statistics
    print(f"\n" + "=" * 60)
    print("FINAL DATASET SUMMARY")
    print("=" * 60)

    # Overall stats
    total_pax = viz_data['PAX'].sum()
    airports_with_pmi = len(viz_data[viz_data['PMI profit%'] > 0])
    avg_pmi_spend = viz_data[viz_data['$/PAX tob. spend - PMI'] > 0]['$/PAX tob. spend - PMI'].mean()

    print(f"Total airports with coordinates: {len(viz_data):,}")
    print(f"Total PAX volume: {total_pax:,.0f}")
    print(f"Airports with PMI data: {airports_with_pmi:,} ({airports_with_pmi / len(viz_data) * 100:.1f}%)")
    print(f"Average PMI spend/PAX: ${avg_pmi_spend:.2f}")

    # Top performers
    print(f"\nTop 5 airports by PAX volume:")
    top_pax = viz_data.nlargest(5, 'PAX')
    for idx, row in top_pax.iterrows():
        print(f"  {row['IATA_CODE']}: {row['AIRPORT_NAME']} - {row['PAX']:,.0f} PAX")

    print(f"\nTop 5 airports by PMI spend/PAX:")
    top_pmi = viz_data[viz_data['$/PAX tob. spend - PMI'] > 0].nlargest(5, '$/PAX tob. spend - PMI')
    for idx, row in top_pmi.iterrows():
        print(f"  {row['IATA_CODE']}: {row['AIRPORT_NAME']} - ${row['$/PAX tob. spend - PMI']:,.2f}/PAX")

    # Hub airports
    hub_airports = viz_data[viz_data['COUNTRY_NAME'] != viz_data['NATIONALITY']]
    print(f"\nHub airports (nationality ≠ country): {len(hub_airports):,}")
    for idx, row in hub_airports.head(5).iterrows():
        print(f"  {row['IATA_CODE']}: {row['AIRPORT_NAME']} ({row['COUNTRY_NAME']}) → {row['NATIONALITY']} passengers")

    print(f"\n✅ FILES READY FOR REACT GLOBE VISUALIZATION")
    print(f"📁 CSV: airport_analysis_final.csv")
    print(f"🌍 GeoJSON: airports_pmi_analysis.geojson")

    return merged_data, geojson


if __name__ == "__main__":
    merged_data, geojson_data = create_final_airport_files()