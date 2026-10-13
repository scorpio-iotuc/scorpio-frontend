import { useId, useState } from "react";

const STATUS_CLASSES = {
  completed: "jobs-status--completed",
  running: "jobs-status--running",
  failed: "jobs-status--failed",
  queued: "jobs-status--queued",
};

// Keep missing timestamps readable, and display valid timestamps in local time.
function JobTime({ value }) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return <time dateTime={value}>{date.toLocaleString()}</time>;
}

function JobDuration({ started, finished }) {
  if (!started || !finished) return "—";
  const startedDate = new Date(started);
  const finishedDate = new Date(finished);
  if (
    Number.isNaN(startedDate.getTime()) ||
    Number.isNaN(finishedDate.getTime())
  )
    return "—";
  const totalSeconds = Math.max(
    0,
    Math.round((finishedDate - startedDate) / 1000),
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${seconds} sec`;
}

export function JobRowAdditionalInfo({
  job,
  isClosing = false,
  onAnimationEnd,
}) {
  if (!job) return null;
  return (
    <div
      className={`jobs-row-additional-info${isClosing ? " jobs-row-additional-info--closing" : ""}`}
      onAnimationEnd={onAnimationEnd}
    >
      <span className="jobs-row-additional-info__line">
        <span className="jobs-row-additional-info__label">Job ID:</span>{" "}
        {job.id}
      </span>
      <span className="jobs-row-additional-info__line">
        <span className="jobs-row-additional-info__label">Status:</span>{" "}
        {job.status || "Unknown"}
      </span>
      <span className="jobs-row-additional-info__line">
        <span className="jobs-row-additional-info__label">Started:</span>{" "}
        <JobTime value={job.started_at} />
      </span>
      <span className="jobs-row-additional-info__line">
        <span className="jobs-row-additional-info__label">Finished:</span>{" "}
        <JobTime value={job.finished_at} />
      </span>
      <span className="jobs-row-additional-info__line">
        <span className="jobs-row-additional-info__label">Downloaded:</span>{" "}
        {job.downloaded === true ? "Yes" : "No"}
      </span>
      <span className="jobs-row-additional-info__line">
        <span className="jobs-row-additional-info__label">Error message:</span>{" "}
        {job.error_message || "-"}
      </span>
    </div>
  );
}

// Each row owns its disclosure state so details stay attached to the job ID.
function JobRow({ job }) {
  const [disclosure, setDisclosure] = useState("closed");
  const isExpanded = disclosure === "open";
  const isVisible = disclosure !== "closed";
  const detailsId = useId();

  // Retain details during the exit animation; another click can reopen them.
  function toggleDetails() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setDisclosure((current) =>
      current === "open" ? (reduceMotion ? "closed" : "closing") : "open",
    );
  }

  function finishClosing(event) {
    if (
      event.target !== event.currentTarget ||
      event.animationName !== "jobs-additional-info-close"
    )
      return;
    setDisclosure((current) => (current === "closing" ? "closed" : current));
  }

  return (
    <>
      <tr>
        <td>
          <JobTime value={job.created} />
        </td>
        <td>
          <span className={`jobs-status ${STATUS_CLASSES[job.status] || ""}`}>
            {job.status || "Unknown"}
          </span>
        </td>
        <td>
          <JobDuration started={job.started_at} finished={job.finished_at} />
        </td>
        <td>
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            aria-label={`${isExpanded ? "Hide" : "More"} info for job ${job.id}`}
            onClick={toggleDetails}
          >
            {isExpanded ? "Hide info" : "More info"}
          </button>
        </td>
      </tr>
      <tr id={detailsId} hidden={!isVisible}>
        <td colSpan={4}>
          {isVisible && (
            <JobRowAdditionalInfo
              job={job}
              isClosing={disclosure === "closing"}
              onAnimationEnd={finishClosing}
            />
          )}
        </td>
      </tr>
    </>
  );
}

export default function JobsTable({ jobs }) {
  return (
    <div
      className="jobs-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Satellite jobs table"
    >
      <table className="jobs-table">
        <caption>Times shown in your local time zone</caption>
        <thead>
          <tr>
            <th scope="col">Execution datetime</th>
            <th scope="col">Status</th>
            <th scope="col">Time lapse</th>
            <th scope="col" aria-label="Job actions" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
          {!jobs.length && (
            <tr>
              <td colSpan={4} className="jobs-empty">
                No jobs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
