import "./MyStations.css";
import { useDashboardContext } from "../../context/DashboardContext";
import Pagination from "../Pagination";
import StationButton from "../StationButton";
import {
  stationIdentifier,
  isOnline,
  formatCoordinate,
} from "../../helper/dashboardUtils";

// MyStations view; shared state persists in the Dashboard provider.
export default function MyStations() {
  const {
    selectedStation,
    setSelectedStation,
    setStationPage,
    deleteConfirmation,
    setDeleteConfirmation,
    isLoading,
    userStations,
    paginatedUserStations,
    handleRegenerateKey,
    handleDeleteStation,
  } = useDashboardContext();

  return (
    <section className="dashboard-panel mystations-panel">
      <div className="dashboard-panel__header">
        <div>
          <p>Ground stations</p>
          <h2>My stations</h2>
        </div>
        <span>{userStations.length}</span>
      </div>

      <div className="dashboard-two-column">
        <div>
          {isLoading ? (
            <p className="dashboard-state">Loading stations...</p>
          ) : (
            <>
              <div className="station-list">
                {paginatedUserStations.items.map((station) => (
                  <StationButton
                    key={stationIdentifier(station)}
                    station={station}
                    isActive={
                      String(stationIdentifier(selectedStation)) ===
                      String(stationIdentifier(station))
                    }
                    onClick={() => {
                      setSelectedStation(station);
                      setDeleteConfirmation("");
                    }}
                  />
                ))}
                {!userStations.length && (
                  <p className="dashboard-state">
                    Aun no tienes estaciones registradas.
                  </p>
                )}
              </div>
              <Pagination
                page={paginatedUserStations.page}
                totalPages={paginatedUserStations.totalPages}
                onPageChange={setStationPage}
              />
            </>
          )}
        </div>

        <div className="dashboard-detail">
          <div className="dashboard-panel__subheader">
            <p>Station detail</p>
            <h3>{selectedStation?.name || "Selecciona una estacion"}</h3>
          </div>

          {selectedStation ? (
            <>
              <dl className="station-detail-grid">
                <div>
                  <dt>Status</dt>
                  <dd
                    className={
                      isOnline(selectedStation)
                        ? "dashboard-success"
                        : "dashboard-danger"
                    }
                  >
                    {isOnline(selectedStation) ? "Online" : "Offline"}
                  </dd>
                </div>
                <div>
                  <dt>Latitude</dt>
                  <dd>{formatCoordinate(selectedStation.latitude)}</dd>
                </div>
                <div>
                  <dt>Longitude</dt>
                  <dd>{formatCoordinate(selectedStation.longitude)}</dd>
                </div>
                <div>
                  <dt>Altitude</dt>
                  <dd>
                    {Number(selectedStation.altitude || 0).toLocaleString()} m
                  </dd>
                </div>
              </dl>

              <div className="dashboard-actions">
                <button type="button" onClick={handleRegenerateKey}>
                  Regenerar llave
                </button>
              </div>

              <div className="danger-zone">
                <h3>Delete station</h3>
                <p>
                  Write <strong>{selectedStation.name}</strong> to confirm.
                </p>
                <input
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(event.target.value)
                  }
                  placeholder="Nombre de la estacion"
                />
                <button
                  type="button"
                  disabled={deleteConfirmation !== selectedStation.name}
                  onClick={handleDeleteStation}
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <p className="dashboard-state">
              Click on a station to view more details.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
