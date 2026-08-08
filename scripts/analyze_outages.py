import pandas as pd

print("Loading dataset...")

df = pd.read_csv("src/data/eaglei_outages_2014.csv")

print("\nCalculating county statistics...")

county_summary = (
    df.groupby(["fips_code", "county", "state"])
    .agg(
        outageFrequency=("customers_out", "count"),
        avgCustomersOut=("customers_out", "mean"),
        maxCustomersOut=("customers_out", "max"),
    )
    .reset_index()
)

county_summary = county_summary.sort_values(
    by="avgCustomersOut",
    ascending=False
)

print("\nTop 20 Counties:")
print(county_summary.head(20))

print("\nTotal Counties:")
print(len(county_summary))

print("\nSaving county summary...")

county_summary.to_csv(
    "src/data/county_summary_2014.csv",
    index=False
)

print("Done!")

print("\nCreating React data file...")

target_counties = county_summary[
    (
        (county_summary["county"] == "Los Angeles") &
        (county_summary["state"] == "California")
    ) |
    (
        (county_summary["county"] == "Maricopa") &
        (county_summary["state"] == "Arizona")
    ) |
    (
        (county_summary["county"] == "Harris") &
        (county_summary["state"] == "Texas")
    ) |
    (
        (county_summary["county"] == "Miami-Dade") &
        (county_summary["state"] == "Florida")
    ) |
    (
        (county_summary["county"] == "Allegheny") &
        (county_summary["state"] == "Pennsylvania")
    )
].copy()

target_counties["name"] = (
    target_counties["county"] + " County, " + target_counties["state"]
)

target_counties["outageFrequency"] = target_counties["outageFrequency"].round(0).astype(int)
target_counties["avgCustomersOut"] = target_counties["avgCustomersOut"].round(0).astype(int)
target_counties["maxCustomersOut"] = target_counties["maxCustomersOut"].round(0).astype(int)

with open("src/data/realCountyMetrics.js", "w") as f:
    f.write("export const realCountyMetrics = ")
    f.write(target_counties.to_json(orient="records", indent=2))
    f.write(";\n")

print("Created src/data/realCountyMetrics.js")