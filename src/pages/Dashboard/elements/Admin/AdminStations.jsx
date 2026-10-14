import { useDashboardContext } from "../../context/DashboardContext";
import Pagination from "../Pagination";
import StationButton from "../StationButton";
import { stationIdentifier } from "../../helper/dashboardUtils";

// AdminStations view; shared state persists in the Dashboard provider.
export default function AdminStations() {
  const {
    setAdminStationPage,
    selectedAdminStation,
    adminStationDeleteConfirmation,
    setAdminStationDeleteConfirmation,
    paginatedAdminStations,
    handleAdminDeleteStation,
    selectAdminStation,
  } = useDashboardContext();

  return (
    <section className="admin-section">
      <div className="dashboard-panel__subheader">
        <p>Stations</p>
        <h3>All stations</h3>
      </div>

      <div className="station-list">
        {paginatedAdminStations.items.map((station) => (
          <StationButton
            key={stationIdentifier(station)}
            station={station}
            isActive={
              String(stationIdentifier(selectedAdminStation)) ===
              String(stationIdentifier(station))
            }
            onClick={() => selectAdminStation(station)}
          />
        ))}
      </div>
      <Pagination
        page={paginatedAdminStations.page}
        totalPages={paginatedAdminStations.totalPages}
        onPageChange={setAdminStationPage}
      />

      {selectedAdminStation && (
        <div className="danger-zone">
          <h3>Delete station</h3>
          <p>
            Write <strong>{selectedAdminStation.name}</strong> to confirm.
          </p>
          <input
            value={adminStationDeleteConfirmation}
            onChange={(event) =>
              setAdminStationDeleteConfirmation(event.target.value)
            }
            placeholder="Station name"
          />
          <button
            type="button"
            disabled={
              adminStationDeleteConfirmation !== selectedAdminStation.name
            }
            onClick={handleAdminDeleteStation}
          >
            Eliminar estacion
          </button>
        </div>
      )}
    </section>
  );
}
