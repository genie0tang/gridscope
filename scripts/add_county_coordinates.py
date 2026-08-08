import pandas as pd
import json
from shapely.geometry import shape

print("Loading county summary...")
county_data = pd.read_csv("src/data/county_summary_2014.csv")

print("Loading counties GeoJSON...")
with open("src/data/counties.geojson", "r") as f:
    geojson = json.load(f)

rows = []

for feature in geojson["features"]:
    fips = str(feature["id"]).zfill(5)
    geom = shape(feature["geometry"])
    centroid = geom.centroid

    rows.append({
        "fips_code": fips,
        "lat": centroid.y,
        "lng": centroid.x,
    })

centroids = pd.DataFrame(rows)

county_data["fips_code"] = county_data["fips_code"].astype(str).str.zfill(5)

merged = county_data.merge(
    centroids,
    on="fips_code",
    how="left"
)

print(merged[["county", "state", "fips_code", "lat", "lng"]].head(20))
print("Missing coordinates:", merged["lat"].isna().sum())

top_counties = merged.copy()

top_counties["name"] = (
    top_counties["county"] + " County, " + top_counties["state"]
)

top_counties["outageFrequency"] = top_counties["outageFrequency"].round(0).astype(int)
top_counties["avgCustomersOut"] = top_counties["avgCustomersOut"].round(0).astype(int)
top_counties["maxCustomersOut"] = top_counties["maxCustomersOut"].round(0).astype(int)

with open("src/data/realCountyMetrics.js", "w") as f:
    f.write("export const realCountyMetrics = ")
    f.write(top_counties.to_json(orient="records", indent=2))
    f.write(";\n")

print("Updated src/data/realCountyMetrics.js with lat/lng")