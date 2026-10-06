const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function statsRequest(endpoint) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`)
  } catch {
    throw new Error('Unable to reach SCORPIO statistics services.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error('Statistics service returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load SCORPIO statistics.')
  }

  return data
}

export async function getActiveStationsCount(status = true) {
  const data = await statsRequest(`/stats/count-active-stations?status=${status}`)
  const total = Number(data?.total)

  if (!Number.isFinite(total)) {
    throw new Error('Active station statistics returned an unexpected payload.')
  }

  return total
}

export async function getTotalPacketsCount() {
  const data = await statsRequest('/stats/count-total-packets')
  const total = Number(data?.totalPacketsReceived)

  if (!Number.isFinite(total)) {
    throw new Error('Packet statistics returned an unexpected payload.')
  }

  return total
}

export async function getStationMonthlyPackets(stationUuid) {
  if (!stationUuid) {
    return { stationUuid: null, days: 30, data: [] }
  }

  const data = await statsRequest(`/stats/count-station-monthly-packets?stationUuid=${encodeURIComponent(stationUuid)}`)

  if (!Array.isArray(data?.data)) {
    throw new Error('Station monthly statistics returned an unexpected payload.')
  }

  return {
    stationUuid: data.stationUuid || stationUuid,
    days: Number(data.days) || 30,
    data: data.data,
  }
}
