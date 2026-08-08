import {
  calculateVulnerability,
  calculateMicrogridImpact,
  calculateProjectedVulnerability,
} from "../utils/scoring";

export default function Sidebar({ selectedPlace, microgridOn, setMicrogridOn }) {
  const vulnerability = calculateVulnerability(selectedPlace);
  const impact = calculateMicrogridImpact(selectedPlace);
  const projectedVulnerability = calculateProjectedVulnerability(
    selectedPlace,
    microgridOn
  );

  return (
    <aside className="sidebar">
      <h2>{selectedPlace.name}</h2>
      <p className="coords">
        {selectedPlace.lat}, {selectedPlace.lng}
      </p>

      <div className="score-card">
        <p>Current Vulnerability</p>
        <h3>{vulnerability}/100</h3>
      </div>

      <label className="toggle-row">
        <span>What if this area had a solar + battery microgrid?</span>
        <input
          type="checkbox"
          checked={microgridOn}
          onChange={() => setMicrogridOn(!microgridOn)}
        />
      </label>

      <div className="score-card improved">
        <p>Projected Vulnerability</p>
        <h3>{projectedVulnerability}/100</h3>
      </div>

      <div className="metrics">
        <div>
          <span>Outage frequency</span>
          <strong>{selectedPlace.outageFrequency}</strong>
        </div>
        <div>
          <span>Avg customers out</span>
          <strong>{selectedPlace.avgCustomersOut}</strong>
        </div>
        <div>
          <span>Max customers out</span>
          <strong>{selectedPlace.maxCustomersOut}</strong>
        </div>
        <div>
          <span>Microgrid impact</span>
          <strong>{impact}/100</strong>
        </div>
      </div>

      <p className="explanation">
        {microgridOn
          ? "The solar + battery microgrid lowers projected vulnerability by adding local backup capacity during outages."
          : "This score estimates grid vulnerability using outage frequency, outage duration, infrastructure risk, and solar potential."}
      </p>
    </aside>
  );
}