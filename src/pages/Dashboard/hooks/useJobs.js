import { useEffect, useState } from "react";
import { getSatelliteUpsertJobs } from "../../../services/satelliteService";

const PAGE_SIZE = 10;

// Fetch only while the admin Jobs view is mounted; cancel stale page requests.
export default function useJobs() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [downloaded, setDownloaded] = useState("");
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const isLoading =
    !result ||
    result.page !== page ||
    result.revision !== revision ||
    result.status !== status ||
    result.downloaded !== downloaded;

  useEffect(() => {
    const controller = new AbortController();
    async function loadJobs() {
      try {
        const data = await getSatelliteUpsertJobs({
          page,
          limit: PAGE_SIZE,
          signal: controller.signal,
          status: status || null,
          downloaded: downloaded === "" ? null : downloaded === "true",
        });
        if (!controller.signal.aborted) {
          setResult({ ...data, page, revision, status, downloaded, error: "" });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            jobs: [],
            pagination: null,
            page,
            revision,
            status,
            downloaded,
            error: error.message,
          });
        }
      }
    }
    loadJobs();
    return () => controller.abort();
  }, [page, revision, status, downloaded]);

  return {
    jobs: isLoading ? [] : result.jobs,
    error: isLoading ? "" : result.error,
    totalPages: isLoading ? 1 : result.pagination?.totalPages || 1,
    page,
    setPage,
    isLoading,
    status,
    downloaded,
    // A new filter starts at page one of the server-filtered result set.
    changeStatus: (value) => {
      setStatus(value);
      setPage(1);
    },
    changeDownloaded: (value) => {
      setDownloaded(value);
      setPage(1);
    },
    refresh: () => setRevision((current) => current + 1),
  };
}
