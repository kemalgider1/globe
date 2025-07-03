import pandas as pd
import json
import numpy as np

def load_and_process_data():
    """Load and process sales data and country mapping"""
    
    # Load the country mapping
    country_map = pd.read_csv('./public/datasets/country_map.csv')
    print(f"Loaded country mapping with {len(country_map)} entries")
    
    # Load the sales data - handle the single column issue
    print("Loading sales data...")
    
    # Read the raw data as a single column
    raw_data = pd.read_csv('./public/datasets/sales_data.csv', header=None)
    
    # Split the first row to get column names
    header_row = raw_data.iloc[0, 0]
    column_names = [col.strip() for col in header_row.split(',')]
    
    print(f"Detected columns: {column_names}")
    
    # Split all data rows
    split_data = []
    for _, row in raw_data.iterrows():
        if pd.notna(row[0]):
            values = row[0].split(',')
            if len(values) == len(column_names):
                split_data.append(values)
    
    sales_data = pd.DataFrame(split_data, columns=column_names)
    # Remove the header row if it was included in data
    if sales_data.iloc[0, 0] == column_names[0]:
        sales_data = sales_data.iloc[1:].reset_index(drop=True)
    
    print(f"Loaded sales data with {len(sales_data)} rows")
    
    # Display sample of sales data
    print("\nSample sales data:")
    print(sales_data.head())
    print("\nSales data columns:", sales_data.columns.tolist())
    
    return country_map, sales_data

def aggregate_sales_by_country(sales_data, country_map):
    """Aggregate sales data by country using the mapping"""
    
    # Create a mapping dictionary from country_map
    geo_to_pmi = {}
    for _, row in country_map.iterrows():
        geo_country = row['GEO-COUNTRY'].strip()
        pmi_country = row['PMI-COUNTRY'].strip() if pd.notna(row['PMI-COUNTRY']) else None
        
        if pmi_country:  # Only add if there's a PMI country mapping
            geo_to_pmi[geo_country] = pmi_country
    
    print(f"Created mapping for {len(geo_to_pmi)} countries")
    
    # Create reverse mapping for easier lookup
    pmi_to_geo = {v: k for k, v in geo_to_pmi.items()}
    
    # Aggregate sales data by country and year
    print("Aggregating sales data...")
    
    # Convert VOLUME to numeric, handling any non-numeric values
    sales_data['VOLUME'] = pd.to_numeric(sales_data['VOLUME'], errors='coerce')
    sales_data['YEAR_NUM'] = pd.to_numeric(sales_data['YEAR_NUM'], errors='coerce')
    
    # Remove rows with invalid data
    sales_data = sales_data.dropna(subset=['VOLUME', 'YEAR_NUM', 'DF_MARKET_NAME'])
    
    print(f"Valid sales records: {len(sales_data)}")
    
    # Group by country and year, sum the volume
    country_year_volume = sales_data.groupby(['DF_MARKET_NAME', 'YEAR_NUM'])['VOLUME'].sum().reset_index()
    
    # Separate 2023 and 2024 data
    volume_2023 = country_year_volume[country_year_volume['YEAR_NUM'] == 2023].set_index('DF_MARKET_NAME')['VOLUME']
    volume_2024 = country_year_volume[country_year_volume['YEAR_NUM'] == 2024].set_index('DF_MARKET_NAME')['VOLUME']
    
    # Calculate PMI (TMO) volume for 2024
    pmi_volume_2024 = sales_data[
        (sales_data['YEAR_NUM'] == 2024) & 
        (sales_data['TMO_NAME'] == 'PMI')
    ].groupby('DF_MARKET_NAME')['VOLUME'].sum()
    
    print(f"Countries with 2023 data: {len(volume_2023)}")
    print(f"Countries with 2024 data: {len(volume_2024)}")
    print(f"Countries with PMI data: {len(pmi_volume_2024)}")
    
    # Create final aggregated data
    aggregated_data = {}
    
    for country in set(volume_2023.index) | set(volume_2024.index):
        vol_2023 = volume_2023.get(country, 0)
        vol_2024 = volume_2024.get(country, 0)
        pmi_vol_2024 = pmi_volume_2024.get(country, 0)
        
        # Calculate percentage of PMI volume to total volume
        pmi_percentage = (pmi_vol_2024 / vol_2024 * 100) if vol_2024 > 0 else 0
        
        aggregated_data[country] = {
            'volume_2023': vol_2023,
            'volume_2024': vol_2024,
            'pmi_volume_2024': pmi_vol_2024,
            'pmi_percentage': pmi_percentage
        }
    
    print(f"Aggregated data for {len(aggregated_data)} countries")
    
    return aggregated_data, geo_to_pmi, pmi_to_geo

def update_geojson(aggregated_data, geo_to_pmi, pmi_to_geo):
    """Update the GeoJSON file with sales data"""
    
    # Load the original GeoJSON
    print("Loading GeoJSON file...")
    with open('./public/datasets/ne_110m_admin_0_countries.geojson', 'r') as f:
        geojson = json.load(f)
    
    print(f"Loaded GeoJSON with {len(geojson['features'])} features")
    
    # Update each country feature
    updated_count = 0
    matched_countries = []
    
    for feature in geojson['features']:
        properties = feature['properties']
        geo_country_name = properties.get('NAME', properties.get('ADMIN', ''))
        
        # Try to find matching sales data
        sales_data_found = False
        
        # Direct match with GEO country name
        if geo_country_name in aggregated_data:
            country_data = aggregated_data[geo_country_name]
            sales_data_found = True
            matched_countries.append(geo_country_name)
        
        # Try PMI country name if available
        elif geo_country_name in geo_to_pmi:
            pmi_country_name = geo_to_pmi[geo_country_name]
            if pmi_country_name in aggregated_data:
                country_data = aggregated_data[pmi_country_name]
                sales_data_found = True
                matched_countries.append(f"{geo_country_name} -> {pmi_country_name}")
        
        # Try reverse mapping
        elif geo_country_name in pmi_to_geo:
            geo_mapped_name = pmi_to_geo[geo_country_name]
            if geo_mapped_name in aggregated_data:
                country_data = aggregated_data[geo_mapped_name]
                sales_data_found = True
                matched_countries.append(f"{geo_country_name} <- {geo_mapped_name}")
        
        # Add sales data to properties
        if sales_data_found:
            properties['volume_2024'] = country_data['volume_2024']
            properties['volume_2023'] = country_data['volume_2023']
            properties['pmi_volume_2024'] = country_data['pmi_volume_2024']
            properties['pmi_percentage'] = country_data['pmi_percentage']
            updated_count += 1
        else:
            # Set default values for countries without sales data
            properties['volume_2024'] = 0
            properties['volume_2023'] = 0
            properties['pmi_volume_2024'] = 0
            properties['pmi_percentage'] = 0
    
    print(f"Updated {updated_count} countries with sales data")
    print("Matched countries:", matched_countries[:10], "..." if len(matched_countries) > 10 else "")
    
    # Save the updated GeoJSON
    output_file = './public/datasets/ne_110m_admin_0_countries_with_sales.geojson'
    with open(output_file, 'w') as f:
        json.dump(geojson, f, indent=2)
    
    print(f"Updated GeoJSON saved to {output_file}")
    
    return geojson

def main():
    """Main processing function"""
    print("Starting sales data processing...")
    
    # Load and process data
    country_map, sales_data = load_and_process_data()
    
    # Aggregate sales data
    aggregated_data, geo_to_pmi, pmi_to_geo = aggregate_sales_by_country(sales_data, country_map)
    
    # Update GeoJSON
    updated_geojson = update_geojson(aggregated_data, geo_to_pmi, pmi_to_geo)
    
    # Print summary statistics
    print("\n=== SUMMARY STATISTICS ===")
    
    # Calculate some statistics
    volumes_2024 = [f['properties'].get('volume_2024', 0) for f in updated_geojson['features']]
    volumes_2023 = [f['properties'].get('volume_2023', 0) for f in updated_geojson['features']]
    pmi_percentages = [f['properties'].get('pmi_percentage', 0) for f in updated_geojson['features']]
    
    countries_with_data = sum(1 for v in volumes_2024 if v > 0)
    
    print(f"Countries with sales data: {countries_with_data}")
    print(f"Total 2024 volume: {sum(volumes_2024):,.2f}")
    print(f"Total 2023 volume: {sum(volumes_2023):,.2f}")
    print(f"Average PMI percentage: {np.mean([p for p in pmi_percentages if p > 0]):.2f}%")
    
    # Show top countries by volume
    print("\n=== TOP 10 COUNTRIES BY 2024 VOLUME ===")
    countries_with_volume = [(f['properties']['NAME'], f['properties'].get('volume_2024', 0)) 
                            for f in updated_geojson['features'] if f['properties'].get('volume_2024', 0) > 0]
    countries_with_volume.sort(key=lambda x: x[1], reverse=True)
    
    for i, (country, volume) in enumerate(countries_with_volume[:10]):
        print(f"{i+1}. {country}: {volume:,.2f}")
    
    print("\nProcessing complete!")

if __name__ == "__main__":
    main() 