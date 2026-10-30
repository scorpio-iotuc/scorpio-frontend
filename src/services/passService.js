const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function requestPasses(path, params, signal) {
  const url = new URL(
    `${API_URL.replace(/\/$/, "")}${path}`,
    window.location.origin,
  );
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== undefined)
      url.searchParams.set(key, String(value));
  }

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to reach SCORPIO pass services.", { cause: error });
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Pass service returned an invalid response.");
  }
  if (!response.ok)
    throw new Error(
      payload?.message || payload?.error || "Unable to load satellite passes.",
    );
  return payload;
}

export async function getStationPasses({
  stationUuid,
  page = 1,
  limit = 100,
  hours = 24,
  minElevation = 10,
  satelliteDisplayName = "",
  satelliteNoradId = "",
  signal,
}) {
  const payload = await requestPasses(
    "/passes",
    {
      stationUuid,
      page,
      limit,
      hours,
      minElevation,
      satelliteDisplayName: satelliteDisplayName.trim(),
      satelliteNoradId: String(satelliteNoradId).trim(),
    },
    signal,
  );
  if (!Array.isArray(payload?.passes) || !payload?.pagination) {
    throw new Error("Pass service returned an unexpected payload.");
  }
  return payload;
}

export async function getPassTrajectory(
  passId,
  { signal, stepSeconds = 50 } = {},
) {
  const payload = await requestPasses(
    `/passes/${encodeURIComponent(passId)}/trajectory`,
    { stepSeconds },
    signal,
  );
  if (
    !Array.isArray(payload?.points) ||
    payload.points.some(
      (point) =>
        !Number.isFinite(Date.parse(point.time)) ||
        !Number.isFinite(point.azimuth) ||
        !Number.isFinite(point.elevation),
    )
  ) {
    throw new Error("Pass service returned an invalid trajectory.");
  }
  return [...payload.points].sort(
    (a, b) => Date.parse(a.time) - Date.parse(b.time),
  );
}
