import { useState } from "react";
import "./App.css";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";

const initialPlace = {
  name: "Los Angeles County, CA",
  countyName: "Los Angeles",
  stateName: "California",
  lat: 34.05,
  lng: -118.24,
  outageFrequency: 5622,
  avgCustomersOut: 2393,
  maxCustomersOut: 39114,
  solarPotential: 91,
  infrastructureRisk: 68,
};

export default function App() {
  const [selectedPlace, setSelectedPlace] = useState(initialPlace);
  const [microgridOn, setMicrogridOn] = useState(false);

  return (
    <div className="app">
      <header className="hero">
        <h1>GridScope</h1>
        <p className="subtitle">Microgrid Resilience Explorer</p>
      </header>
      <main>
        <section className="map-panel">
          <MapView
            selectedPlace={selectedPlace}
            onSelectLocation={setSelectedPlace}
          />
        </section>

        <Sidebar
          selectedPlace={selectedPlace}
          microgridOn={microgridOn}
          setMicrogridOn={setMicrogridOn}
        />
      </main>
    </div>
  );
}