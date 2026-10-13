import { getAuthHeaders } from './sessionService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function listSatellites({ page = 1, limit = 100, displayName = '', noradId = '', signal } = {}) {
  const url = new URL(`${API_URL}/satellites`, `${window.location.origin}/api/satellites`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))

  if (displayName.trim()) {
    url.searchParams.set('displayName', displayName.trim())
  }

  if (String(noradId).trim()) {
    url.searchParams.set('noradId', String(noradId).trim())
  }

  let response

  try {
    response = await fetch(url.toString(), { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to reach SCORPIO satellite services.', { cause: error })
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('Satellite service returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Unable to load satellite data.')
  }

  const satellites = Array.isArray(payload) ? payload : payload?.data

  if (!Array.isArray(satellites)) {
    throw new Error('Satellite service returned an unexpected payload.')
  }

  return {
    satellites: satellites.slice(0, limit),
    pagination: payload?.pagination || {
      page,
      limit,
      total: satellites.length,
      totalPages: 1,
    },
  }
}


export async function getSatelliteUpsertJobs({ page = 1, limit = 100, downloaded = null, status = null, signal } = {}) {
  const url = new URL(`${API_URL}/satellites/upsert/jobs`, `${window.location.origin}/api/satellites/upsert/jobs`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))

  if (downloaded !== null) {
    url.searchParams.set('downloaded', String(downloaded))
  }

  if (status !== null) {
    url.searchParams.set('status', String(status))
  }

  let response;

  try {
    response = await fetch(url.toString(), { headers: getAuthHeaders(), signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to reach SCORPIO satellite services.', { cause: error })
  }

  let payload;

  try {
    payload = await response.json()
  } catch {
    throw new Error('Satellite service returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Unable to load satellite upsert jobs.')
  }

  const jobs = Array.isArray(payload) ? payload : payload?.data

  if (!Array.isArray(jobs)) {
    throw new Error('Satellite service returned an unexpected payload.')
  }

  return {
    jobs: jobs.slice(0, limit),
    pagination: payload?.pagination || {
      page,
      limit,
      total: jobs.length,
      totalPages: 1,
    },
  }
}


export async function getSatelliteLastUpsertJob({ signal } = {}) {
  const url = new URL(`${API_URL}/satellites/upsert/`, `${window.location.origin}/api/satellites/upsert/`)
  let response;

  try {
    response = await fetch(url.toString(), { headers: getAuthHeaders(), signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to reach SCORPIO satellite services.', { cause: error })
  }
  let payload;

  try {
    payload = await response.json()
  } catch {
    throw new Error('Satellite service returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Unable to load the last satellite upsert jobs.')
  }

  return payload
}
