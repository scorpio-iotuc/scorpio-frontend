import "./NewStation.css";
import { useDashboardContext } from "../../context/DashboardContext";

// NewStation view; shared state persists in the Dashboard provider.
export default function NewStation() {
  const {
    stationForm,
    isSavingStation,
    handleStationFormChange,
    handleCreateStation,
  } = useDashboardContext();

  return (
    <section className="dashboard-panel newstation-panel">
      <div className="dashboard-panel__header">
        <div>
          <p>Create station</p>
          <h2>New station</h2>
        </div>
      </div>

      <form
        className="dashboard-form dashboard-form--narrow"
        onSubmit={handleCreateStation}
      >
        <label>
          Name
          <input
            name="name"
            value={stationForm.name}
            onChange={handleStationFormChange}
            required
          />
        </label>
        <label>
          Latitude
          <input
            name="latitude"
            type="number"
            step="any"
            value={stationForm.latitude}
            onChange={handleStationFormChange}
            required
          />
        </label>
        <label>
          Longitude
          <input
            name="longitude"
            type="number"
            step="any"
            value={stationForm.longitude}
            onChange={handleStationFormChange}
            required
          />
        </label>
        <label>
          Altitude
          <input
            name="altitude"
            type="number"
            step="any"
            value={stationForm.altitude}
            onChange={handleStationFormChange}
            required
          />
        </label>
        <button type="submit" disabled={isSavingStation}>
          {isSavingStation ? "Creating..." : "Create station"}
        </button>
      </form>
    </section>
  );
}
