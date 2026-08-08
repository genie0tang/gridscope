import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { realCountyMetrics } from "../data/realCountyMetrics";
import { calculateVulnerability } from "../utils/scoring";

function getMarkerColor(vulnerability) {
  if (vulnerability >= 75) return "red";
  if (vulnerability >= 50) return "orange";
  if (vulnerability >= 25) return "yellow";
  return "green";
}

function getHeatColor(vulnerability) {
  if (vulnerability >= 80) return "#b91c1c";
if (vulnerability >= 60) return "#ea580c";
if (vulnerability >= 40) return "#eab308";
if (vulnerability >= 20) return "#65a30d";
return "#15803d";
}

function createColoredIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function getDistance(lat1, lng1, lat2, lng2) {
  const latDiff = lat1 - lat2;
  const lngDiff = lng1 - lng2;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

function findNearestCounty(lat, lng) {
  let nearestCounty = realCountyMetrics[0];
  let shortestDistance = Infinity;

  for (const county of realCountyMetrics) {
    const distance = getDistance(lat, lng, county.lat, county.lng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestCounty = county;
    }
  }

  return nearestCounty;
}

function findCountyByFips(fips) {
  return realCountyMetrics.find(
    (county) =>
      String(county.fips_code).padStart(5, "0") ===
      String(fips).padStart(5, "0")
  );
}

function ClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(event) {
      const clickedLat = Number(event.latlng.lat.toFixed(4));
      const clickedLng = Number(event.latlng.lng.toFixed(4));
      const nearestCounty = findNearestCounty(clickedLat, clickedLng);

      onSelectLocation({
        ...nearestCounty,
        clickedLat,
        clickedLng,
      });
    },
  });

  return null;
}

export default function MapView({ selectedPlace, onSelectLocation }) {
  const [countiesGeoJson, setCountiesGeoJson] = useState(null);

  useEffect(() => {
    fetch("/src/data/counties.geojson")
      .then((response) => response.json())
      .then((data) => setCountiesGeoJson(data))
      .catch((error) => console.error("Failed to load county GeoJSON:", error));
  }, []);

  function getCountyStyle(feature) {
    const county = findCountyByFips(feature.id);

    if (!county) {
      return {
        fillColor: "#64748b",
        color: "transparent",
        weight: 0.4,
        fillOpacity: 0.04,
      };
    }

    const vulnerability = calculateVulnerability(county);

    return {
      fillColor: getHeatColor(vulnerability),
      color: "transparent",
      weight: 0.7,
      fillOpacity: 0.5,
    };
  }

  function handleEachCounty(feature, layer) {
    const county = findCountyByFips(feature.id);

    if (!county) return;

    const vulnerability = calculateVulnerability(county);

    layer.on("click", () => {
      onSelectLocation(county);
    });

    layer.bindPopup(
      `<strong>${county.name}</strong><br/>Vulnerability: ${vulnerability}/100`
    );
  }

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      minZoom={4}
      maxBounds={[
        [24.396308, -125.0],
        [49.384358, -66.93457],
      ]}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
      className="real-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {countiesGeoJson && (
        <GeoJSON
          data={countiesGeoJson}
          style={getCountyStyle}
          onEachFeature={handleEachCounty}
        />
      )}

      <ClickHandler onSelectLocation={onSelectLocation} />

      {selectedPlace?.lat && selectedPlace?.lng && (
        <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
          <Popup>
            <strong>{selectedPlace.name}</strong>
            <br />
            Vulnerability: {calculateVulnerability(selectedPlace)}/100
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}