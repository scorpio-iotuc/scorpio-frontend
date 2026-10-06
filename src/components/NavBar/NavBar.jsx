import { FaMagnifyingGlass, FaRightToBracket } from 'react-icons/fa6'
import './NavBar.css'
import { useState } from 'react'
import { Menu, MenuToggle } from './elements/Menu/Menu.jsx'
import { FilterSidebar } from './elements/FilterSidebar/FilterSidebar.jsx'
import { NavbarProvider } from './NavBarContext.jsx'

export default function Navbar({
  telemetryMessage = '',
  telemetryMessageId = '',
  isPreviewData = false,
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
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <NavbarProvider>
      <header className="mission-navbar">
        <a
          className="mission-navbar__brand"
          href="/"
          aria-label="SCORPIO home"
        >
          <span>SCORPIO</span>
        </a>
        <div className="mission-navbar__telemetry" aria-live="polite">
          {telemetryMessage && (
            <div className="mission-navbar__telemetry-track" key={telemetryMessageId || telemetryMessage}>
              <span className={`mission-navbar__pulse ${isPreviewData ? 'mission-navbar__pulse--preview' : ''}`} />
              <span>{telemetryMessage}</span>
            </div>
          )}
        </div>
        <nav
          className="mission-navbar__actions"
          aria-label="Primary navigation"
        >
          <div className="mission-navbar__hosted-by">
            <span>Powered by</span>
            <a href="https://cpsrtc.cl" target="_blank" rel="noopener noreferrer" aria-label="CPS-RTC">
              <img src="/cps-rtc-horizontal-white.svg" alt="CPS-RTC" />
            </a>
          </div>
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setIsFilterOpen(true)}
          >
            <FaMagnifyingGlass />
          </button>
          <a href="/login" aria-label="Login">
            <FaRightToBracket />
          </a>
          <MenuToggle />
        </nav>
      </header>

      <Menu />

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        stations={stations}
        satellites={satellites}
        selectedStationIds={selectedStationIds}
        satelliteFilters={satelliteFilters}
        isSearchingSatellites={isSearchingSatellites}
        hasActiveSatelliteSearch={hasActiveSatelliteSearch}
        satellitePagination={satellitePagination}
        satellitePage={satellitePage}
        satelliteLimit={satelliteLimit}
        onSelectedStationIdsChange={onSelectedStationIdsChange}
        onSatelliteFiltersChange={onSatelliteFiltersChange}
        onSatellitePageChange={onSatellitePageChange}
        onSatelliteLimitChange={onSatelliteLimitChange}
      />
    </NavbarProvider>
  )
}
