import PacketList from './PacketList'
import './StationPanel.css'
import StationMonthlyChart from './StationMonthlyChart'
import SatellitePassesPanel from './SatellitePassesPanel'

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

function isStationOnline(station) {
  return station?.status === true || station?.status === 'online'
}

function formatDate(value) {
  if (!value) return 'Unavailable'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unavailable'
  }

  return dateFormatter.format(date)
}

function formatCoordinate(value) {
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? coordinate.toFixed(4) : 'Unavailable'
}

function DetailRow({ label, value, tone }) {
  return (
    <div className="station-panel__row">
      <dt>{label}</dt>
      <dd className={tone ? `station-panel__value--${tone}` : undefined}>{value}</dd>
    </div>
  )
}

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    pages.push('start-ellipsis')
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < totalPages - 1) {
    pages.push('end-ellipsis')
  }

  pages.push(totalPages)
  return pages
}

function PacketPagination({ pagination, currentPage, onPageChange }) {
  const totalPages = Number(pagination?.totalPages || 1)
  if (totalPages <= 1) return null

  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <nav className="packet-pagination" aria-label="Packet pagination">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        ‹ Back
      </button>

      <div className="packet-pagination__pages">
        {pageItems.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={item === currentPage ? 'packet-pagination__page--active' : ''}
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? 'page' : undefined}
            >
              {item}
            </button>
          ) : (
            <span key={item}>...</span>
          ),
        )}
      </div>

      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next ›
      </button>
    </nav>
  )
}

export default function StationPanel({
  station,
  isOpen,
  onClose,
  packets,
  packetPagination,
  packetPage,
  onPacketPageChange,
  isLoadingPackets,
  packetError,
  monthlyPacketStats,
  isLoadingMonthlyStats,
  monthlyStatsError,
  onSelectPacket,
}) {
  const isOnline = isStationOnline(station)

  return (
    <aside className={`station-panel ${isOpen ? 'station-panel--open' : ''}`} aria-hidden={!isOpen}>
      <div className="station-panel__header">
        <div>
          <p className="station-panel__eyebrow">SCORPIO Station</p>
          <h2>{station?.name || 'Station information'}</h2>
        </div>
        <button className="station-panel__close" type="button" onClick={onClose} aria-label="Close station panel">
          x
        </button>
      </div>

      {station ? (
        <div className="station-panel__content">
          <section className="station-panel__section">
            <h3>Information</h3>
            <dl>
              <DetailRow label="Name" value={station.name || station.uuid || station.id} />
              <DetailRow label="Latitude" value={formatCoordinate(station.latitude)} />
              <DetailRow label="Longitude" value={formatCoordinate(station.longitude)} />
              <DetailRow label="Altitude" value={`${Number(station.altitude || 0).toLocaleString()} m`} />
              <DetailRow label="Status" value={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'online' : 'offline'} />
              <DetailRow label="Created" value={formatDate(station.createdAt)} />
              <DetailRow label="Last Seen" value={formatDate(station.lastSeen)} />
            </dl>
          </section>

          {/* Satellite passes panel */}
          {isOpen && <SatellitePassesPanel key={station.uuid || station.id} stationUuid={station.uuid} />}

          <section className="station-panel__section">
            <h3>Statistics</h3>
            {/* Chart stats - every packet retrieved from the station */}
            <StationMonthlyChart
              stats={monthlyPacketStats}
              isLoading={isLoadingMonthlyStats}
              error={monthlyStatsError}
            />
          </section>

          <section className="station-panel__section">
            <h3>Recent packets</h3>
            {packetPagination && (
              <p className="packet-list__meta">
                Showing {packets.length} of {packetPagination.total ?? 'latest'} packets
              </p>
            )}
            <PacketList
              station={station}
              packets={packets}
              isLoading={isLoadingPackets}
              error={packetError}
              onSelectPacket={onSelectPacket}
            />
            <PacketPagination
              pagination={packetPagination}
              currentPage={packetPage}
              onPageChange={onPacketPageChange}
            />
          </section>
        </div>
      ) : (
        <p className="station-panel__empty">Select a ground station to inspect telemetry infrastructure.</p>
      )}
    </aside>
  )
}
