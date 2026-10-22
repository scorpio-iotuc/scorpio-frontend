import { useState } from "react";
import { usePasses } from "../../hooks/usePasses";
import "./SatellitePassesPanel.css";


function time(value) {
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : timeFormatter.format(date);
}
function date(value) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    // No timeZone: "UTC"
  });
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : dateFormatter.format(parsed);
}
const elevation = (value) => `${Number(value).toFixed(1)}°`;
const clampElevation = (value) => Math.max(0, Math.min(90, value));

function TrajectoryCharts({ points }) {
  const start = Date.parse(points[0].time);
  const duration = Math.max(1, Date.parse(points.at(-1).time) - start);
  const xy = points.map((point) => [
    48 + ((Date.parse(point.time) - start) / duration) * 504,
    192 - (clampElevation(point.elevation) / 90) * 168,
  ]);
  // Azimuth is clockwise from north; zenith is at the centre of the skyplot.
  const sky = points.map((point) => {
    const radius = ((90 - clampElevation(point.elevation)) / 90) * 100;
    const angle = (point.azimuth * Math.PI) / 180;
    return [140 + radius * Math.sin(angle), 140 - radius * Math.cos(angle)];
  });
  return (
    <div className="satellite-passes__charts">
      <figure>
        <figcaption>
          Elevation vs. time 
        </figcaption>
        <svg
          viewBox="0 0 580 238"
          role="img"
          aria-label="Satellite elevation in degrees over time in UTC"
        >
          {[0, 30, 60, 90].map((tick) => (
            <g key={tick}>
              <line
                className="satellite-passes__grid"
                x1="48"
                x2="552"
                y1={192 - (tick / 90) * 168}
                y2={192 - (tick / 90) * 168}
              />
              <text x="38" y={196 - (tick / 90) * 168} textAnchor="end">
                {tick}°
              </text>
            </g>
          ))}
          <polyline
            className="satellite-passes__path"
            points={xy.map((p) => p.join(",")).join(" ")}
          />
          {points.map((point, index) => (
            <circle
              className="satellite-passes__sample"
              key={`${point.time}-${index}`}
              cx={xy[index][0]}
              cy={xy[index][1]}
              r="3"
            >
              <title>
                {time(point.time)} UTC · {elevation(point.elevation)}
              </title>
            </circle>
          ))}
          {[0, 0.5, 1].map((fraction) => (
            <text
              key={fraction}
              x={48 + fraction * 504}
              y="218"
              textAnchor={
                fraction === 0 ? "start" : fraction === 1 ? "end" : "middle"
              }
            >
              {time(start + duration * fraction)}
            </text>
          ))}
        </svg>
      </figure>
      <figure>
        <figcaption>
          Skyplot 
          <br />
          <span>North up - East right</span>
        </figcaption>
        <svg
          className="satellite-passes__skyplot"
          viewBox="0 0 280 280"
          role="img"
          aria-label="Satellite sky track with north up, east right, horizon on the outer ring and zenith at the centre"
        >
          {[100, 200 / 3, 100 / 3].map((radius) => (
            <circle
              key={radius}
              className="satellite-passes__grid"
              cx="140"
              cy="140"
              r={radius}
            />
          ))}
          <path
            className="satellite-passes__grid"
            d="M40 140H240 M140 40V240"
          />
          <text x="140" y="24" textAnchor="middle">
            N
          </text>
          <text x="258" y="144">
            E
          </text>
          <text x="140" y="263" textAnchor="middle">
            S
          </text>
          <text x="16" y="144">
            W
          </text>
          {[0, 30, 60, 90].map((tick) => (
            <text key={tick} x="145" y={138 - ((90 - tick) / 90) * 100}>
              {tick}°
            </text>
          ))}
          <polyline
            className="satellite-passes__path"
            points={sky.map((p) => p.join(",")).join(" ")}
          />
          <circle
            className="satellite-passes__aos"
            cx={sky[0][0]}
            cy={sky[0][1]}
            r="5"
          >
            <title>AOS · {time(points[0].time)} UTC</title>
          </circle>
          <circle
            className="satellite-passes__los"
            cx={sky.at(-1)[0]}
            cy={sky.at(-1)[1]}
            r="5"
          >
            <title>LOS · {time(points.at(-1).time)} UTC</title>
          </circle>
        </svg>
        <p className="satellite-passes__legend">
          <span>● AOS (rise)</span>
          <span>● LOS (set)</span>
        </p>
      </figure>
    </div>
  );
}

export default function SatellitePassesPanel({ stationUuid }) {
  const [filters, setFilters] = useState({
    satelliteDisplayName: "",
    satelliteNoradId: "",
    minElevation: "10",
  });
  const {
    passes,
    pagination,
    page,
    isLoading,
    error,
    selectedPass,
    selectPass,
    trajectory,
    trajectoryError,
    isLoadingTrajectory,
    applyFilters,
    setPage,
    refresh,
    retryTrajectory,
  } = usePasses(stationUuid);
  const update = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));

  return (
    <section className="station-panel__section satellite-passes">
      <h3>
        Satellite Pass Predictions <span>Next 24 h</span>
      </h3>
      <form
        className="satellite-passes__filters"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters(filters);
        }}
      >
        <label>
          Satellite name
          <input
            type="search"
            placeholder="e.g. starlink"
            value={filters.satelliteDisplayName}
            onChange={update("satelliteDisplayName")}
          />
        </label>
        <label>
          NORAD ID
          <input
            type="number"
            min="1"
            max="2147483647"
            step="1"
            placeholder="e.g. 63869"
            value={filters.satelliteNoradId}
            onChange={update("satelliteNoradId")}
          />
        </label>
        <label>
          Min. elevation (°)
          <input
            type="number"
            required
            min="0"
            max="90"
            step="any"
            value={filters.minElevation}
            onChange={update("minElevation")}
          />
        </label>
        <button type="submit" disabled={!stationUuid}>
          Apply filters
        </button>
      </form>
      <div className="satellite-passes__heading">
        <h4>Upcoming passes</h4>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading || !stationUuid}
        >
          Refresh
        </button>
      </div>
      <div aria-live="polite">
        {isLoading ? (
          <p className="station-panel__state">Loading upcoming passes…</p>
        ) : error ? (
          <p
            className="station-panel__state station-panel__state--error"
            role="alert"
          >
            {error}
          </p>
        ) : !passes.length ? (
          <p className="station-panel__state">
            No passes match these filters in the next 24 hours.
          </p>
        ) : (
          <>
            <div className="satellite-passes__table-wrap">
              <table>
                <caption className="satellite-passes__caption">
                  Select a pass to view its trajectory. This table shows the next 24 hours of predicted passes for this station, filtered by the criteria above. 
                  The attributes are Satellite name, AOS (Acquisition of Signal) time, LOS (Loss of Signal) time, and maximum elevation during the pass.
                  The table is sorted by AOS (rise) time.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Satellite</th>
                    <th scope="col">AOS </th>
                    <th scope="col">LOS </th>
                    <th scope="col">Max. el.</th>
                    {/* <th scope="col">Details</th> */}
                  </tr>
                </thead>
                <tbody>
                  {passes.map((pass) => (
                    <tr
                      key={pass.passId}
                      className={
                        selectedPass?.passId === pass.passId
                          ? "satellite-passes__selected"
                          : ""
                      }
                      onClick={() => selectPass(pass)}
                    >
                      <td>
                        <strong>
                          {pass.satelliteName || `NORAD ${pass.satelliteId}`}
                        </strong>
                        <small>NORAD {pass.satelliteId}</small>
                      </td>
                      <td>
                        {time(pass.aos)}
                        <small>{date(pass.aos)}</small>
                      </td>
                      <td>
                        {time(pass.los)}
                        <small>{date(pass.los)}</small>
                      </td>
                      <td>{elevation(pass.maxElevation)}</td>
                      {/* <td>
                        <button
                          type="button"
                          aria-label={`View ${pass.satelliteName || pass.satelliteId} pass at ${date(pass.aos)} ${time(pass.aos)} UTC`}
                          aria-pressed={selectedPass?.passId === pass.passId}
                          onClick={(event) => {
                            event.stopPropagation();
                            selectPass(pass);
                          }}
                        >
                          Details ›
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav
              className="satellite-passes__pagination"
              aria-label="Satellite pass pagination"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Back
              </button>
              <span>
                Page {page} of {totalPages} / {" "}
                Total of {Number(pagination.total).toLocaleString()} passes
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </nav>
          </>
        )}
      </div>
      {selectedPass && (
        <div className="satellite-passes__details" aria-live="polite">
          
          
          {isLoadingTrajectory ? (
            <p role="status">Loading trajectory…</p>
          ) : trajectoryError ? (
            <div role="alert">
              <p className="station-panel__state--error">{trajectoryError}</p>
              <button type="button" onClick={retryTrajectory}>
                Retry trajectory
              </button>
            </div>
          ) : trajectory.length ? (
            <TrajectoryCharts points={trajectory} />
          ) : (
            <p>No trajectory points available for this pass.</p>
          )}
          <h4>Selected pass</h4>
          <p>
            Satellite name: {selectedPass.satelliteName || `NORAD ${selectedPass.satelliteId}`}
            <br />
            NORAD ID: {selectedPass.satelliteId}
            <br />
            AOS: {date(selectedPass.aos)} {time(selectedPass.aos)}
            <br />
            LOS: {date(selectedPass.los)} {time(selectedPass.los)} 
            <br />
            Peak: {time(selectedPass.maxElevationAt)} 
            <br />
            Max. Elevation: {elevation(selectedPass.maxElevation)}
          </p>
        </div>
      )}
    </section>
  );
}
