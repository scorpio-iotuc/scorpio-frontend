import { isOnline, formatCoordinate } from "../helper/dashboardUtils";

// Shared presentation for Dashboard lists.
export default function StationButton({ station, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`station-list__item ${isActive ? "station-list__item--active" : ""}`}
      onClick={onClick}
    >
      <span
        className={
          isOnline(station)
            ? "station-list__dot station-list__dot--online"
            : "station-list__dot"
        }
      />
      <strong>{station.name}</strong>
      <small>
        {formatCoordinate(station.latitude)},{" "}
        {formatCoordinate(station.longitude)}
      </small>
    </button>
  );
}
