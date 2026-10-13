import useJobs from "../../hooks/useJobs";
import Pagination from "../Pagination";
import JobsTable from "./JobsTable";
import "./Jobs.css";

// Access is restricted by the Dashboard view registry before this view mounts.
export default function Jobs() {
  const {
    jobs,
    error,
    isLoading,
    page,
    totalPages,
    setPage,
    refresh,
    status,
    downloaded,
    changeStatus,
    changeDownloaded,
  } = useJobs();

  return (
    <section className="dashboard-panel jobs-panel" aria-busy={isLoading}>
      <div className="dashboard-panel__header">
        <div>
          <p>Satellite synchronization</p>
          <h2>Jobs</h2>
        </div>
        <button type="button" onClick={refresh} disabled={isLoading}>
          Refresh
        </button>
      </div>
      {/* Filters remain available while a previous request is cancelled. */}
      <div className="jobs-filters">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
          </select>
        </label>
        <label>
          Downloaded
          <select
            value={downloaded}
            onChange={(event) => changeDownloaded(event.target.value)}
          >
            <option value="">All</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </label>
      </div>
      {isLoading ? (
        <p className="dashboard-state" role="status">
          Loading jobs...
        </p>
      ) : error ? (
        <p className="jobs-error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <JobsTable jobs={jobs} />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
