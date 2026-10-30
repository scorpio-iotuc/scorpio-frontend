import { useEffect, useState } from 'react'
import { getPassTrajectory, getStationPasses } from '../services/passService'

export function usePasses(stationUuid) {
  const [query, setQuery] = useState({ page: 1, minElevation: 10, satelliteDisplayName: '', satelliteNoradId: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPass, setSelectedPass] = useState(null)
  const [trajectory, setTrajectory] = useState([])
  const [trajectoryError, setTrajectoryError] = useState('')
  const [isLoadingTrajectory, setIsLoadingTrajectory] = useState(false)
  const [trajectoryAttempt, setTrajectoryAttempt] = useState(0)

  useEffect(() => {
    if (!stationUuid) return
    const controller = new AbortController()
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getStationPasses({ stationUuid, ...query, signal: controller.signal })
        if (!controller.signal.aborted) setResult(data)
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [stationUuid, query])

  useEffect(() => {
    if (!selectedPass) return
    const controller = new AbortController()
    async function load() {
      setIsLoadingTrajectory(true)
      setTrajectoryError('')
      try {
        const points = await getPassTrajectory(selectedPass.passId, { signal: controller.signal })
        if (!controller.signal.aborted) setTrajectory(points)
      } catch (error) {
        if (!controller.signal.aborted) setTrajectoryError(error.message)
      } finally {
        if (!controller.signal.aborted) setIsLoadingTrajectory(false)
      }
    }
    load()
    return () => controller.abort()
  }, [selectedPass, trajectoryAttempt])

  function updateQuery(next) {
    setSelectedPass(null)
    setResult(null)
    setError('')
    setIsLoading(true)
    setQuery((current) => ({ ...current, ...next }))
  }

  function selectPass(pass) {
    setTrajectory([])
    setTrajectoryError('')
    setIsLoadingTrajectory(true)
    setSelectedPass(pass)
    setTrajectoryAttempt((attempt) => attempt + 1)
  }

  return {
    passes: result?.passes || [], pagination: result?.pagination, page: query.page,
    isLoading: Boolean(stationUuid) && isLoading,
    error: stationUuid ? error : 'This station has no UUID available for pass predictions.',
    selectedPass, selectPass, trajectory, trajectoryError, isLoadingTrajectory,
    applyFilters: (filters) => updateQuery({ ...filters, page: 1 }),
    setPage: (page) => updateQuery({ page }),
    refresh: () => updateQuery({}),
    retryTrajectory: () => selectPass(selectedPass),
  }
}
