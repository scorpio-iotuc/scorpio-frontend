const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function buildPacketUrl(station, { limit = 10, page = 1 } = {}) {
  const url = new URL(`${API_URL}/packets`, `${window.location.origin}/api/packets`)

  if (station?.uuid) {
    url.searchParams.set('stationUuid', station.uuid)
  } else if (station?.id) {
    url.searchParams.set('stationId', station.id)
  }

  url.searchParams.set('limit', String(limit))
  url.searchParams.set('page', String(page))

  return url.toString()
}

export async function getStationPackets(station, options = {}) {
  if (!station?.uuid && !station?.id) {
    return []
  }

  let response

  try {
    response = await fetch(buildPacketUrl(station, options))
  } catch {
    throw new Error('Unable to reach SCORPIO packet services.')
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('Packet service returned an invalid response.')
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error
    throw new Error(message || 'Unable to load station packets.')
  }

  const packets = Array.isArray(payload) ? payload : payload?.data

  if (!Array.isArray(packets)) {
    throw new Error('Packet service returned an unexpected payload.')
  }

  if (station.uuid) {
    return {
      packets: packets.filter((packet) => !packet.stationUuid || packet.stationUuid === station.uuid),
      pagination: payload?.pagination || { page: options.page || 1, limit: options.limit || 10 },
    }
  }

  return {
    packets: packets.filter((packet) => !packet.stationId || Number(packet.stationId) === Number(station.id)),
    pagination: payload?.pagination || { page: options.page || 1, limit: options.limit || 10 },
  }
}
