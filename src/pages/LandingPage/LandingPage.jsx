import { useEffect, useMemo, useState } from 'react'
import GlobeView from '../../components/GlobeView/GlobeView'
import Navbar from '../../components/NavBar/NavBar'
import PacketDetailPanel from '../../components/StationPanel/PacketDetailPanel'
import SatellitePanel from '../../components/StationPanel/SatellitePanel'
import StationPanel from '../../components/StationPanel/StationPanel'
import StatusBar from '../../components/StatusBar/StatusBar'
import { useLandingStats } from '../../hooks/useLandingStats'
import { useLiveSatellitePositions } from '../../hooks/useLiveSatellitePositions'
import { usePacketEvents } from '../../hooks/usePacketEvents'
import { useSatelliteSearch } from '../../hooks/useSatelliteSearch'
import { useSatellites } from '../../hooks/useSatellites'
import { useStationMonthlyPackets } from '../../hooks/useStationMonthlyPackets'
import { useStationPackets } from '../../hooks/useStationPackets'
import { useStations } from '../../hooks/useStations'
import './LandingPage.css'

export default function LandingPage() {
  const { stations, isLoading, error, isPreviewData } = useStations()
  const { highlightedStationUuids, latestPacketEvent } = usePacketEvents()
  const { satellites, satelliteError } = useSatellites()
  const { activeStationsTotal, totalPacketsReceived, isLoadingStats, statsError } = useLandingStats()
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [packetPage, setPacketPage] = useState(1)
  const [selectedStationFilterIds, setSelectedStationFilterIds] = useState([])
  const [satelliteFilters, setSatelliteFilters] = useState({ displayName: '', noradId: '' })
  const [telemetryNotice, setTelemetryNotice] = useState(null)
  const {
    satelliteSearchResults,
    satelliteSearchPagination,
    satelliteSearchPage,
    satelliteSearchLimit,
    isSearchingSatellites,
    satelliteSearchError,
    hasActiveSatelliteSearch,
    setSatelliteSearchPage,
    setSatelliteSearchLimit,
  } = useSatelliteSearch(satelliteFilters)
  const visibleSatelliteSource = hasActiveSatelliteSearch ? satelliteSearchResults : satellites
  const liveSatellites = useLiveSatellitePositions(visibleSatelliteSource)
  const isSidebarOpen = Boolean(selectedStation)
  const { stationPackets, packetPagination, isLoadingPackets, packetError } = useStationPackets(
    selectedStation,
    isSidebarOpen,
    packetPage,
  )
  const { monthlyPacketStats, isLoadingMonthlyStats, monthlyStatsError } = useStationMonthlyPackets(
    selectedStation,
    isSidebarOpen,
  )

  const localActiveStations = useMemo(
    () => stations.filter((station) => station.status === true || station.status === 'online').length,
    [stations],
  )
  const filteredStations = useMemo(() => {
    if (!selectedStationFilterIds.length) return stations

    const selectedIds = new Set(selectedStationFilterIds.map(String))
    return stations.filter((station) => selectedIds.has(String(station.uuid || station.id)))
  }, [stations, selectedStationFilterIds])
  const selectedLiveSatellite = useMemo(() => {
    if (!selectedSatellite) return null

    const selectedId = String(selectedSatellite.noradId || selectedSatellite.id)
    return liveSatellites.find((satellite) => String(satellite.noradId || satellite.id) === selectedId) || selectedSatellite
  }, [liveSatellites, selectedSatellite])
  const activeStations = activeStationsTotal ?? localActiveStations
  const packetCount = totalPacketsReceived ?? packetPagination?.total ?? stationPackets.length

  useEffect(() => {
    if (!latestPacketEvent) return undefined

    const message = `New packet received at ${latestPacketEvent.stationName || 'station'} from ${
      latestPacketEvent.satelliteDisplayName || `NORAD ${latestPacketEvent.satelliteNoradId || 'unknown'}`
    }`

    const showTimeoutId = window.setTimeout(() => {
      setTelemetryNotice({
        id: `${latestPacketEvent.stationUuid || 'station'}-${latestPacketEvent.createdAt || Date.now()}`,
        message,
      })
    }, 0)

    const hideTimeoutId = window.setTimeout(() => {
      setTelemetryNotice(null)
    }, 10000)

    return () => {
      window.clearTimeout(showTimeoutId)
      window.clearTimeout(hideTimeoutId)
    }
  }, [latestPacketEvent])

  function handleStationSelect(station) {
    setSelectedSatellite(null)
    setSelectedPacket(null)
    setPacketPage(1)
    setSelectedStation(station)
  }

  function handleSatelliteSelect(satellite) {
    setSelectedStation(null)
    setSelectedPacket(null)
    setPacketPage(1)
    setSelectedSatellite(satellite)
  }

  function handleStationFilterChange(nextStationIds) {
    setSelectedStationFilterIds(nextStationIds)

    if (selectedStation && nextStationIds.length) {
      const selectedIds = new Set(nextStationIds.map(String))
      const stationId = String(selectedStation.uuid || selectedStation.id)

      if (!selectedIds.has(stationId)) {
        setSelectedPacket(null)
        setPacketPage(1)
        setSelectedStation(null)
      }
    }
  }

  function handleClosePanel() {
    setSelectedPacket(null)
    setPacketPage(1)
    setSelectedStation(null)
    setSelectedSatellite(null)
  }

  function handleBackToStation() {
    setSelectedPacket(null)
  }

  return (
    <main className="landing-page">
      <Navbar
        telemetryMessage={telemetryNotice?.message || ''}
        telemetryMessageId={telemetryNotice?.id || ''}
        isPreviewData={isPreviewData}
        stations={stations}
        satellites={liveSatellites}
        selectedStationIds={selectedStationFilterIds}
        satelliteFilters={satelliteFilters}
        isSearchingSatellites={isSearchingSatellites}
        hasActiveSatelliteSearch={hasActiveSatelliteSearch}
        satellitePagination={satelliteSearchPagination}
        satellitePage={satelliteSearchPage}
        satelliteLimit={satelliteSearchLimit}
        onSelectedStationIdsChange={handleStationFilterChange}
        onSatelliteFiltersChange={setSatelliteFilters}
        onSatellitePageChange={setSatelliteSearchPage}
        onSatelliteLimitChange={setSatelliteSearchLimit}
      />
      <section className="landing-page__mission">
        <GlobeView
          stations={filteredStations}
          satellites={liveSatellites}
          highlightedStationUuids={highlightedStationUuids}
          selectedStation={selectedStation}
          selectedSatellite={selectedLiveSatellite}
          selectedOrbitSatellite={selectedSatellite}
          onStationSelect={handleStationSelect}
          onSatelliteSelect={handleSatelliteSelect}
          onResetView={handleClosePanel}
        />

        <StationPanel
          station={selectedStation}
          isOpen={isSidebarOpen && !selectedPacket}
          onClose={handleClosePanel}
          packets={stationPackets}
          packetPagination={packetPagination}
          packetPage={packetPage}
          onPacketPageChange={setPacketPage}
          isLoadingPackets={isLoadingPackets}
          packetError={packetError}
          monthlyPacketStats={monthlyPacketStats}
          isLoadingMonthlyStats={isLoadingMonthlyStats}
          monthlyStatsError={monthlyStatsError}
          onSelectPacket={setSelectedPacket}
        />

        <SatellitePanel
          satellite={selectedLiveSatellite}
          isOpen={Boolean(selectedLiveSatellite)}
          onClose={handleClosePanel}
        />

        <PacketDetailPanel
          station={selectedStation}
          packet={selectedPacket}
          isOpen={Boolean(selectedPacket)}
          onBack={handleBackToStation}
          onClose={handleClosePanel}
        />
      </section>
      <StatusBar
        activeStations={activeStations}
        packetCount={packetCount}
        isLoading={isLoading || isLoadingStats}
        error={statsError || error || satelliteError || satelliteSearchError}
      />
    </main>
  )
}
