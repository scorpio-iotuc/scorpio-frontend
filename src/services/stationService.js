const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('scorpio_token')

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

async function stationRequest(endpoint, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach SCORPIO station services.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to complete station request.')
  }

  return data
}

export async function getStations() {
  let response

  try {
    response = await fetch(`${API_URL}/stations?page=1&limit=100`, {
      headers: {
        ...getAuthHeaders(),
      },
    })
  } catch {
    throw new Error('Unable to reach SCORPIO station services.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error('Station service returned an invalid response.')
  }

  if (!response.ok) {
    const message = data?.message || data?.error
    throw new Error(message || 'Unable to load ground station data.')
  }

  const stations = Array.isArray(data) ? data : data?.data

  if (!Array.isArray(stations)) {
    throw new Error('Station service returned an unexpected payload.')
  }

  return stations
}

export async function createStation(payload) {
  return stationRequest('/stations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteStation(stationUuid) {
  return stationRequest(`/stations/${stationUuid}`, {
    method: 'DELETE',
  })
}

export async function regenerateStationKey(stationUuid) {
  return stationRequest(`/stations/${stationUuid}/regenerate-key`, {
    method: 'POST',
  })
}
