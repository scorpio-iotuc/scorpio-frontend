import { useEffect, useMemo, useState } from 'react'
import {
  createStation,
  deleteStation,
  getStations,
  regenerateStationKey,
} from '../../services/stationService'
import { clearSession, getCurrentUserId, getToken } from '../../services/sessionService'
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../../services/userService'
import './Dashboard.css'

const PAGE_SIZE = 5

const initialStationForm = {
  name: '',
  latitude: '',
  longitude: '',
  altitude: '',
}

const initialSettingsForm = {
  name: '',
  email: '',
  password: '',
}

const initialAdminUserForm = {
  name: '',
  email: '',
  type: 'normal',
  password: '',
}

const initialCreateUserForm = {
  name: '',
  email: '',
  password: '',
  type: 'normal',
}

function isOnline(station) {
  return station?.status === true || station?.status === 'online'
}

function stationIdentifier(station) {
  return station?.uuid || station?.id
}

function buildStationKey(response) {
  const stationId = response?.stationId || response?.stationUuid || response?.uuid || response?.station?.uuid || response?.id
  const ownerKey = response?.ownerKey

  if (response?.stationKey) return response.stationKey
  if (stationId && ownerKey) return `${stationId}.${ownerKey}`
  return ownerKey || ''
}

function formatCoordinate(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(5) : 'N/A'
}

function clampPage(page, totalPages) {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1))
}

function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = clampPage(page, totalPages)
  const start = (safePage - 1) * pageSize

  return {
    page: safePage,
    totalPages,
    total: items.length,
    items: items.slice(start, start + pageSize),
  }
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="dashboard-pagination" aria-label="Dashboard pagination">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Back
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </nav>
  )
}

function StationButton({ station, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`station-list__item ${isActive ? 'station-list__item--active' : ''}`}
      onClick={onClick}
    >
      <span className={isOnline(station) ? 'station-list__dot station-list__dot--online' : 'station-list__dot'} />
      <strong>{station.name}</strong>
      <small>
        {formatCoordinate(station.latitude)}, {formatCoordinate(station.longitude)}
      </small>
    </button>
  )
}

export default function Dashboard() {
  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [stationForm, setStationForm] = useState(initialStationForm)
  const [settingsForm, setSettingsForm] = useState(initialSettingsForm)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('stations')
  const [stationPage, setStationPage] = useState(1)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [accountDeleteConfirmation, setAccountDeleteConfirmation] = useState('')
  const [keyModal, setKeyModal] = useState({ isOpen: false, title: '', stationKey: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingStation, setIsSavingStation] = useState(false)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUserPagination, setAdminUserPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [adminUserPage, setAdminUserPage] = useState(1)
  const [adminStationPage, setAdminStationPage] = useState(1)
  const [selectedAdminUser, setSelectedAdminUser] = useState(null)
  const [adminUserForm, setAdminUserForm] = useState(initialAdminUserForm)
  const [adminUserDeleteConfirmation, setAdminUserDeleteConfirmation] = useState('')
  const [selectedAdminStation, setSelectedAdminStation] = useState(null)
  const [adminStationDeleteConfirmation, setAdminStationDeleteConfirmation] = useState('')
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false)
  const [isSavingAdminUser, setIsSavingAdminUser] = useState(false)
  const [createUserForm, setCreateUserForm] = useState(initialCreateUserForm)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  const userId = useMemo(() => getCurrentUserId(), [])
  const isAdmin = user?.type === 'admin'
  const userStations = useMemo(() => {
    if (!userId) return stations

    return stations.filter((station) => !station.ownerId || Number(station.ownerId) === Number(userId))
  }, [stations, userId])
  const paginatedUserStations = useMemo(() => paginate(userStations, stationPage), [userStations, stationPage])
  const paginatedAdminStations = useMemo(() => paginate(stations, adminStationPage), [stations, adminStationPage])

  useEffect(() => {
    if (!getToken()) {
      window.location.assign('/login')
      return
    }

    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const [stationData, userData] = await Promise.all([
          getStations(),
          userId ? getUserById(userId) : Promise.resolve(null),
        ])

        if (!isMounted) return

        setStations(stationData)
        setUser(userData)
        setSettingsForm({
          name: userData?.name || '',
          email: userData?.email || '',
          password: '',
        })
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [userId])

  useEffect(() => {
    if (!isAdmin) return undefined

    let isMounted = true

    async function loadAdminUsers() {
      setIsLoadingAdminUsers(true)

      try {
        const { users, pagination } = await getUsers({ page: adminUserPage, limit: PAGE_SIZE })

        if (!isMounted) return

        setAdminUsers(users)
        setAdminUserPagination({
          page: pagination.page || adminUserPage,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || users.length,
        })
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoadingAdminUsers(false)
        }
      }
    }

    loadAdminUsers()

    return () => {
      isMounted = false
    }
  }, [adminUserPage, isAdmin])

  function handleStationFormChange(event) {
    const { name, value } = event.target
    setStationForm((current) => ({ ...current, [name]: value }))
  }

  function handleSettingsChange(event) {
    const { name, value } = event.target
    setSettingsForm((current) => ({ ...current, [name]: value }))
  }

  function handleAdminUserFormChange(event) {
    const { name, value } = event.target
    setAdminUserForm((current) => ({ ...current, [name]: value }))
  }

  function handleCreateUserFormChange(event) {
    const { name, value } = event.target
    setCreateUserForm((current) => ({ ...current, [name]: value }))
  }

  async function refreshStations(nextSelectedId) {
    const stationData = await getStations()
    setStations(stationData)

    if (nextSelectedId) {
      setSelectedStation(stationData.find((station) => String(stationIdentifier(station)) === String(nextSelectedId)) || null)
    }
  }

  async function refreshAdminUsers() {
    const { users, pagination } = await getUsers({ page: adminUserPage, limit: PAGE_SIZE })
    setAdminUsers(users)
    setAdminUserPagination({
      page: pagination.page || adminUserPage,
      totalPages: pagination.totalPages || 1,
      total: pagination.total || users.length,
    })
  }

  async function handleCreateStation(event) {
    event.preventDefault()
    setIsSavingStation(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        name: stationForm.name.trim(),
        latitude: Number(stationForm.latitude),
        longitude: Number(stationForm.longitude),
        altitude: Number(stationForm.altitude),
      }

      if (userId) {
        payload.ownerId = Number(userId)
      }

      if (!payload.name || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude) || !Number.isFinite(payload.altitude)) {
        throw new Error('Nombre, latitud, longitud y altitud son obligatorios.')
      }

      const response = await createStation(payload)
      const stationKey = buildStationKey(response)
      setStationForm(initialStationForm)
      await refreshStations(response?.uuid || response?.id || response?.station?.uuid || response?.station?.id)
      setKeyModal({
        isOpen: Boolean(stationKey),
        title: 'Llave de nueva estacion',
        stationKey,
      })
      setMessage('Estacion creada correctamente.')
      setActiveTab('stations')
    } catch (createError) {
      setError(createError.message)
    } finally {
      setIsSavingStation(false)
    }
  }

  async function handleRegenerateKey() {
    if (!selectedStation) return

    setError('')
    setMessage('')

    try {
      const response = await regenerateStationKey(stationIdentifier(selectedStation))
      const stationKey = buildStationKey({ ...response, uuid: selectedStation.uuid, id: selectedStation.id })

      if (!stationKey) {
        throw new Error('La API no retorno una llave valida.')
      }

      setKeyModal({
        isOpen: true,
        title: `Nueva llave para ${selectedStation.name}`,
        stationKey,
      })
      setMessage('Llave regenerada correctamente.')
    } catch (regenerateError) {
      setError(regenerateError.message)
    }
  }

  async function handleDeleteStation() {
    if (!selectedStation || deleteConfirmation !== selectedStation.name) return

    setError('')
    setMessage('')

    try {
      await deleteStation(stationIdentifier(selectedStation))
      setSelectedStation(null)
      setDeleteConfirmation('')
      await refreshStations()
      setMessage('Estacion eliminada correctamente.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function handleAdminDeleteStation() {
    if (!selectedAdminStation || adminStationDeleteConfirmation !== selectedAdminStation.name) return

    setError('')
    setMessage('')

    try {
      await deleteStation(stationIdentifier(selectedAdminStation))
      setSelectedAdminStation(null)
      setAdminStationDeleteConfirmation('')
      await refreshStations()
      setMessage('Estacion eliminada por admin.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function handleUpdateUser(event) {
    event.preventDefault()
    if (!userId) return

    setIsSavingUser(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        name: settingsForm.name.trim(),
        email: settingsForm.email.trim(),
      }

      if (settingsForm.password) {
        payload.password = settingsForm.password
      }

      const updatedUser = await updateUser(userId, payload)
      setUser(updatedUser)
      setSettingsForm((current) => ({ ...current, password: '' }))
      setMessage('Configuracion actualizada.')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setIsSavingUser(false)
    }
  }

  async function handleAdminUpdateUser(event) {
    event.preventDefault()
    if (!selectedAdminUser) return

    setIsSavingAdminUser(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        name: adminUserForm.name.trim(),
        email: adminUserForm.email.trim(),
      }

      if (adminUserForm.type !== selectedAdminUser.type) {
        payload.type = adminUserForm.type
      }

      if (adminUserForm.password) {
        payload.password = adminUserForm.password
      }

      const updatedUser = await updateUser(selectedAdminUser.id, payload)
      setSelectedAdminUser(updatedUser)
      setAdminUserForm({
        name: updatedUser?.name || '',
        email: updatedUser?.email || '',
        type: updatedUser?.type || 'normal',
        password: '',
      })
      await refreshAdminUsers()
      setMessage('Usuario actualizado.')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setIsSavingAdminUser(false)
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault()
    setIsCreatingUser(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        name: createUserForm.name.trim(),
        email: createUserForm.email.trim(),
        password: createUserForm.password,
        type: createUserForm.type,
      }

      await createUser(payload)
      setCreateUserForm(initialCreateUserForm)
      await refreshAdminUsers()
      setMessage('Usuario creado correctamente.')
    } catch (createError) {
      setError(createError.message)
    } finally {
      setIsCreatingUser(false)
    }
  }

  async function handleAdminDeleteUser() {
    if (!selectedAdminUser || adminUserDeleteConfirmation !== selectedAdminUser.email) return

    setError('')
    setMessage('')

    try {
      await deleteUser(selectedAdminUser.id)
      setSelectedAdminUser(null)
      setAdminUserForm(initialAdminUserForm)
      setAdminUserDeleteConfirmation('')
      await refreshAdminUsers()
      setMessage('Usuario eliminado.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function handleDeleteAccount() {
    if (!userId || accountDeleteConfirmation !== settingsForm.email) return

    setError('')
    setMessage('')

    try {
      await deleteUser(userId)
      clearSession()
      window.location.assign('/login')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function copyStationKey() {
    await navigator.clipboard.writeText(keyModal.stationKey)
    setMessage('Llave copiada al portapapeles.')
  }

  function logout() {
    clearSession()
    window.location.assign('/login')
  }

  function selectAdminUser(nextUser) {
    setSelectedAdminUser(nextUser)
    setAdminUserDeleteConfirmation('')
    setAdminUserForm({
      name: nextUser?.name || '',
      email: nextUser?.email || '',
      type: nextUser?.type || 'normal',
      password: '',
    })
  }

  function selectAdminStation(station) {
    setSelectedAdminStation(station)
    setAdminStationDeleteConfirmation('')
  }

  const navItems = [
    { id: 'stations', label: 'My stations' },
    { id: 'new-station', label: 'New station' },
    { id: 'settings', label: 'Settings' },
  ]

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin' })
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <a href="/" className="dashboard-brand">
          SCORPIO
        </a>
        <div>
          <p>{user?.name || 'Operador'}</p>
          <button type="button" onClick={logout}>Salir</button>
        </div>
      </header>

      <section className="dashboard-shell">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <div>
            <p>Operator console</p>
            <h1>Control panel</h1>
          </div>

          <nav>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'dashboard-sidebar__item--active' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="dashboard-workspace">
          {activeTab === 'stations' && (
            <section className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p>Ground stations</p>
                  <h2>My stations</h2>
                </div>
                <span>{userStations.length}</span>
              </div>

              <div className="dashboard-two-column">
                <div>
                  {isLoading ? (
                    <p className="dashboard-state">Loading stations...</p>
                  ) : (
                    <>
                      <div className="station-list">
                        {paginatedUserStations.items.map((station) => (
                          <StationButton
                            key={stationIdentifier(station)}
                            station={station}
                            isActive={String(stationIdentifier(selectedStation)) === String(stationIdentifier(station))}
                            onClick={() => {
                              setSelectedStation(station)
                              setDeleteConfirmation('')
                            }}
                          />
                        ))}
                        {!userStations.length && <p className="dashboard-state">Aun no tienes estaciones registradas.</p>}
                      </div>
                      <Pagination
                        page={paginatedUserStations.page}
                        totalPages={paginatedUserStations.totalPages}
                        onPageChange={setStationPage}
                      />
                    </>
                  )}
                </div>

                <div className="dashboard-detail">
                  <div className="dashboard-panel__subheader">
                    <p>Station detail</p>
                    <h3>{selectedStation?.name || 'Selecciona una estacion'}</h3>
                  </div>

                  {selectedStation ? (
                    <>
                      <dl className="station-detail-grid">
                        <div>
                          <dt>Status</dt>
                          <dd className={isOnline(selectedStation) ? 'dashboard-success' : 'dashboard-danger'}>
                            {isOnline(selectedStation) ? 'Online' : 'Offline'}
                          </dd>
                        </div>
                        <div>
                          <dt>Latitude</dt>
                          <dd>{formatCoordinate(selectedStation.latitude)}</dd>
                        </div>
                        <div>
                          <dt>Longitude</dt>
                          <dd>{formatCoordinate(selectedStation.longitude)}</dd>
                        </div>
                        <div>
                          <dt>Altitude</dt>
                          <dd>{Number(selectedStation.altitude || 0).toLocaleString()} m</dd>
                        </div>
                      </dl>

                      <div className="dashboard-actions">
                        <button type="button" onClick={handleRegenerateKey}>Regenerar llave</button>
                      </div>

                      <div className="danger-zone">
                        <h3>Delete station</h3>
                        <p>Write <strong>{selectedStation.name}</strong> to confirm.</p>
                        <input
                          value={deleteConfirmation}
                          onChange={(event) => setDeleteConfirmation(event.target.value)}
                          placeholder="Nombre de la estacion"
                        />
                        <button type="button" disabled={deleteConfirmation !== selectedStation.name} onClick={handleDeleteStation}>
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="dashboard-state">Click on a station to view more details.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'new-station' && (
            <section className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p>Create station</p>
                  <h2>New station</h2>
                </div>
              </div>

              <form className="dashboard-form dashboard-form--narrow" onSubmit={handleCreateStation}>
                <label>
                  Name
                  <input name="name" value={stationForm.name} onChange={handleStationFormChange} required />
                </label>
                <label>
                  Latitude
                  <input name="latitude" type="number" step="any" value={stationForm.latitude} onChange={handleStationFormChange} required />
                </label>
                <label>
                  Longitude
                  <input name="longitude" type="number" step="any" value={stationForm.longitude} onChange={handleStationFormChange} required />
                </label>
                <label>
                  Altitude
                  <input name="altitude" type="number" step="any" value={stationForm.altitude} onChange={handleStationFormChange} required />
                </label>
                <button type="submit" disabled={isSavingStation}>{isSavingStation ? 'Creating...' : 'Create station'}</button>
              </form>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p>User settings</p>
                  <h2>Settings</h2>
                </div>
              </div>

              <form className="dashboard-form dashboard-form--narrow" onSubmit={handleUpdateUser}>
                <label>
                  Name
                  <input name="name" value={settingsForm.name} onChange={handleSettingsChange} />
                </label>
                <label>
                  Email
                  <input name="email" type="email" value={settingsForm.email} onChange={handleSettingsChange} />
                </label>
                <label>
                  New password
                  <input name="password" type="password" value={settingsForm.password} onChange={handleSettingsChange} placeholder="Opcional" />
                </label>
                <button type="submit" disabled={isSavingUser}>{isSavingUser ? 'Saving...' : 'Save changes'}</button>
              </form>

              <div className="danger-zone danger-zone--narrow">
                <h3>Delete account</h3>
                <p>Enter your email to confirm.</p>
                <input
                  value={accountDeleteConfirmation}
                  onChange={(event) => setAccountDeleteConfirmation(event.target.value)}
                  placeholder={settingsForm.email || 'email'}
                />
                <button type="button" disabled={accountDeleteConfirmation !== settingsForm.email} onClick={handleDeleteAccount}>
                  Delete account
                </button>
              </div>
            </section>
          )}

          {activeTab === 'admin' && isAdmin && (
            <section className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p>Admin operations</p>
                  <h2>Users and stations</h2>
                </div>
              </div>

              <div className="admin-grid">
                <section className="admin-section">
                  <div className="dashboard-panel__subheader">
                    <p>Users</p>
                    <h3>Manage users</h3>
                  </div>

                  {isLoadingAdminUsers ? (
                    <p className="dashboard-state">Loading users...</p>
                  ) : (
                    <>
                      <div className="admin-list">
                        {adminUsers.map((adminUser) => (
                          <button
                            key={adminUser.id}
                            type="button"
                            className={`admin-list__item ${selectedAdminUser?.id === adminUser.id ? 'admin-list__item--active' : ''}`}
                            onClick={() => selectAdminUser(adminUser)}
                          >
                            <strong>{adminUser.name || adminUser.email}</strong>
                            <span>{adminUser.email}</span>
                            <small>{adminUser.type || 'normal'}</small>
                          </button>
                        ))}
                      </div>
                      <Pagination
                        page={adminUserPagination.page}
                        totalPages={adminUserPagination.totalPages}
                        onPageChange={setAdminUserPage}
                      />
                    </>
                  )}

                  {selectedAdminUser && (
                    <form className="dashboard-form" onSubmit={handleAdminUpdateUser}>
                      <label>
                        Name
                        <input name="name" value={adminUserForm.name} onChange={handleAdminUserFormChange} />
                      </label>
                      <label>
                        Email
                        <input name="email" type="email" value={adminUserForm.email} onChange={handleAdminUserFormChange} />
                      </label>
                      <label>
                        Type
                        <select name="type" value={adminUserForm.type} onChange={handleAdminUserFormChange}>
                          <option value="normal">normal</option>
                          <option value="admin">admin</option>
                        </select>
                      </label>
                      <label>
                        New password
                        <input name="password" type="password" value={adminUserForm.password} onChange={handleAdminUserFormChange} placeholder="Opcional" />
                      </label>
                      <button type="submit" disabled={isSavingAdminUser}>{isSavingAdminUser ? 'Guardando...' : 'Actualizar usuario'}</button>
                    </form>
                  )}

                  {selectedAdminUser && (
                    <div className="danger-zone">
                      <h3>Delete user</h3>
                      <p>Write <strong>{selectedAdminUser.email}</strong> to confirm.</p>
                      <input
                        value={adminUserDeleteConfirmation}
                        onChange={(event) => setAdminUserDeleteConfirmation(event.target.value)}
                        placeholder="User email"
                      />
                      <button
                        type="button"
                        disabled={adminUserDeleteConfirmation !== selectedAdminUser.email}
                        onClick={handleAdminDeleteUser}
                      >
                        Delete user
                      </button>
                    </div>
                  )}

                  <div className="dashboard-panel__subheader">
                    <p>Users</p>
                    <h3>Create user</h3>
                  </div>

                  <form className="dashboard-form" onSubmit={handleCreateUser}>
                    <label>
                      Name
                      <input name="name" value={createUserForm.name} onChange={handleCreateUserFormChange} required />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" value={createUserForm.email} onChange={handleCreateUserFormChange} required />
                    </label>
                    <label>
                      Password
                      <input name="password" type="password" value={createUserForm.password} onChange={handleCreateUserFormChange} required />
                    </label>
                    <label>
                      Type
                      <select name="type" value={createUserForm.type} onChange={handleCreateUserFormChange}>
                        <option value="normal">normal</option>
                        <option value="admin">admin</option>
                      </select>
                    </label>
                    <button type="submit" disabled={isCreatingUser}>{isCreatingUser ? 'Creando...' : 'Crear usuario'}</button>
                  </form>
                </section>

                <section className="admin-section">
                  <div className="dashboard-panel__subheader">
                    <p>Stations</p>
                    <h3>All stations</h3>
                  </div>

                  <div className="station-list">
                    {paginatedAdminStations.items.map((station) => (
                      <StationButton
                        key={stationIdentifier(station)}
                        station={station}
                        isActive={String(stationIdentifier(selectedAdminStation)) === String(stationIdentifier(station))}
                        onClick={() => selectAdminStation(station)}
                      />
                    ))}
                  </div>
                  <Pagination
                    page={paginatedAdminStations.page}
                    totalPages={paginatedAdminStations.totalPages}
                    onPageChange={setAdminStationPage}
                  />

                  {selectedAdminStation && (
                    <div className="danger-zone">
                      <h3>Delete station</h3>
                      <p>Write <strong>{selectedAdminStation.name}</strong> to confirm.</p>
                      <input
                        value={adminStationDeleteConfirmation}
                        onChange={(event) => setAdminStationDeleteConfirmation(event.target.value)}
                        placeholder="Station name"
                      />
                      <button
                        type="button"
                        disabled={adminStationDeleteConfirmation !== selectedAdminStation.name}
                        onClick={handleAdminDeleteStation}
                      >
                        Eliminar estacion
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </section>
          )}
        </section>
      </section>

      {(message || error) && (
        <div className={`dashboard-toast ${error ? 'dashboard-toast--error' : ''}`} role="status">
          {error || message}
        </div>
      )}

      {keyModal.isOpen && (
        <div className="key-modal" role="dialog" aria-modal="true" aria-labelledby="station-key-title">
          <div className="key-modal__content">
            <p>Station authentication key</p>
            <h2 id="station-key-title">{keyModal.title}</h2>
            <code>{keyModal.stationKey}</code>
            <p>
              This key is shown only once. Store it securely to authenticate your stations when they send packets to SCORPIO.
            </p>
            <div className="key-modal__actions">
              <button type="button" onClick={copyStationKey}>Copy key</button>
              <button type="button" onClick={() => setKeyModal({ isOpen: false, title: '', stationKey: '' })}>
                I already saved it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
