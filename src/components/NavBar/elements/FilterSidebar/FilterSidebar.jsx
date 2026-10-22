import { useMemo, useState } from 'react'
import './FilterSidebar.css'

function stationIdentifier(station) {
  return String(station?.uuid || station?.id)
}

function isStationOnline(station) {
  return station?.status === true || station?.status === 'online'
}

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 6) {
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

function SatellitePagination({
  pagination,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Number(pagination?.totalPages || 1)
  const pageItems = getPageItems(currentPage, totalPages)

  if (!pagination || totalPages <= 1) {
    return (
      <div className="satellite-pagination satellite-pagination--single">
        <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value)} aria-label="Satellites per page">
          <option value="10">10 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>
    )
  }

  return (
    <nav className="satellite-pagination" aria-label="Satellite pagination">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        ‹
      </button>

      <div className="satellite-pagination__pages">
        {pageItems.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={item === currentPage ? 'satellite-pagination__page--active' : ''}
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
        ›
      </button>

      <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value)} aria-label="Satellites per page">
        <option value="10">10 / page</option>
        <option value="25">25 / page</option>
        <option value="50">50 / page</option>
        <option value="100">100 / page</option>
      </select>
    </nav>
  )
}

export const FilterSidebar = ({
  isOpen,
  onClose,
  stations = [],
  satellites = [],
  selectedStationIds = [],
  satelliteFilters = { displayName: '', noradId: '' },
  isSearchingSatellites = false,
  hasActiveSatelliteSearch = false,
  satellitePagination,
  satellitePage = 1,
  satelliteLimit = 25,
  onSelectedStationIdsChange,
  onSatelliteFiltersChange,
  onSatellitePageChange,
  onSatelliteLimitChange,
}) => {
  const [stationSearchTerm, setStationSearchTerm] = useState('')
  const activeStations = useMemo(
    () =>
      stations
        .filter(isStationOnline)
        .filter((station) => (station.name || '').toLowerCase().includes(stationSearchTerm.trim().toLowerCase())),
    [stations, stationSearchTerm],
  )
  const selectedIds = new Set(selectedStationIds.map(String))

  function toggleStation(station) {
    const stationId = stationIdentifier(station)
    const nextIds = new Set(selectedIds)

    if (nextIds.has(stationId)) {
      nextIds.delete(stationId)
    } else {
      nextIds.add(stationId)
    }

    onSelectedStationIdsChange?.(Array.from(nextIds))
  }

  function updateSatelliteFilter(name, value) {
    onSatelliteFiltersChange?.({
      ...satelliteFilters,
      [name]: value,
    })
  }

  function clearFilters() {
    setStationSearchTerm('')
    onSelectedStationIdsChange?.([])
    onSatelliteFiltersChange?.({ displayName: '', noradId: '' })
    onSatellitePageChange?.(1)
  }

  return (
    <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen} inert={!isOpen}>
      <div className="filter-header">
        <div>
          <p>Mission filters</p>
        </div>
        <button className="filter-close" type="button" onClick={onClose} aria-label="Cerrar filtros">
          X
        </button>
      </div>

      <div className="filter-content">
        <section className="filter-section">
          <label className="filter-search">
            Find active station
            <input
              type="search"
              value={stationSearchTerm}
              onChange={(event) => setStationSearchTerm(event.target.value)}
              placeholder="station name"
            />
          </label>


          <div className="filter-title">
            <span>Ground stations</span>
            <strong>{selectedIds.size || 'All'}</strong>
          </div>

          <div className="checkbox-group">
            {activeStations.map((station) => {
              const stationId = stationIdentifier(station)

              return (
                <label className="checkbox-label" key={stationId}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(stationId)}
                    onChange={() => toggleStation(station)}
                  />
                  <span>{station.name || stationId}</span>
                </label>
              )
            })}

            {!activeStations.length && (
              <p className="filter-empty">No active stations match this filter.</p>
            )}
          </div>
        </section>

        <section className="filter-section">
          <label className="filter-search">
            Search satellite by name
            <input
              type="search"
              value={satelliteFilters.displayName}
              onChange={(event) => updateSatelliteFilter('displayName', event.target.value)}
              placeholder="Display name"
            />
          </label>

          <label className="filter-search">
            Search satellite by NORAD ID
            <input
              type="search"
              inputMode="numeric"
              value={satelliteFilters.noradId}
              onChange={(event) => updateSatelliteFilter('noradId', event.target.value)}
              placeholder="NORAD ID"
            />
          </label>

        </section>

        <div className="filter-section">
          <div className="filter-title">
            <span>Satellites</span>
            <strong>
              {hasActiveSatelliteSearch
                ? `${Math.min(satellitePagination?.total || satellites.length, satellitePagination?.maxResults || 500)} results`
                : 'Initial 100'}
            </strong>
          </div>

          <div className="checkbox-group checkbox-group--compact">
            {hasActiveSatelliteSearch && (
              <SatellitePagination
                pagination={satellitePagination}
                currentPage={satellitePage}
                pageSize={satelliteLimit}
                onPageChange={onSatellitePageChange}
                onPageSizeChange={onSatelliteLimitChange}
              />
            )}
            {isSearchingSatellites && <p className="filter-empty">Searching satellites...</p>}

            {!isSearchingSatellites &&
              satellites.map((satellite) => (
                <div className="checkbox-label checkbox-label--readonly" key={satellite.noradId || satellite.id}>
                  <span>
                    {satellite.noradId || 'N/A'} - {satellite.displayName || `Unknown`}
                  </span>
                </div>
              ))}

            {!isSearchingSatellites && !satellites.length && (
              <p className="filter-empty">No satellites match this filter.</p>
            )}
          </div>


        </div>

        <div className="filter-actions">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!selectedIds.size && !stationSearchTerm && !satelliteFilters.displayName && !satelliteFilters.noradId}
          >
            Clear
          </button>
          <button type="button" onClick={onClose}>
            Apply
          </button>
        </div>
      </div>
    </aside>
  )
}
