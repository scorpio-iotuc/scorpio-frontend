import {
  getStations,
  createStation,
  deleteStation,
  regenerateStationKey,
} from "../../../services/stationService";
import {
  initialStationForm,
  stationIdentifier,
  buildStationKey,
} from "../helper/dashboardUtils";

// Encapsulate this domain’s mutations and preserve shared feedback.
export default function useStationActions(state) {
  const {
    setStations,
    selectedStation,
    setSelectedStation,
    stationForm,
    setStationForm,
    setActiveTab,
    deleteConfirmation,
    setDeleteConfirmation,
    setKeyModal,
    setIsSavingStation,
    setMessage,
    setError,
    selectedAdminStation,
    setSelectedAdminStation,
    adminStationDeleteConfirmation,
    setAdminStationDeleteConfirmation,
    userId,
  } = state;

  async function refreshStations(nextSelectedId) {
    const stationData = await getStations();
    setStations(stationData);

    if (nextSelectedId) {
      setSelectedStation(
        stationData.find(
          (station) =>
            String(stationIdentifier(station)) === String(nextSelectedId),
        ) || null,
      );
    }
  }

  async function handleCreateStation(event) {
    event.preventDefault();
    setIsSavingStation(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: stationForm.name.trim(),
        latitude: Number(stationForm.latitude),
        longitude: Number(stationForm.longitude),
        altitude: Number(stationForm.altitude),
      };

      if (userId) {
        payload.ownerId = Number(userId);
      }

      if (
        !payload.name ||
        !Number.isFinite(payload.latitude) ||
        !Number.isFinite(payload.longitude) ||
        !Number.isFinite(payload.altitude)
      ) {
        throw new Error(
          "Nombre, latitud, longitud y altitud son obligatorios.",
        );
      }

      const response = await createStation(payload);
      const stationKey = buildStationKey(response);
      setStationForm(initialStationForm);
      await refreshStations(
        response?.uuid ||
          response?.id ||
          response?.station?.uuid ||
          response?.station?.id,
      );
      setKeyModal({
        isOpen: Boolean(stationKey),
        title: "Llave de nueva estacion",
        stationKey,
      });
      setMessage("Estacion creada correctamente.");
      setActiveTab("stations");
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSavingStation(false);
    }
  }

  async function handleRegenerateKey() {
    if (!selectedStation) return;

    setError("");
    setMessage("");

    try {
      const response = await regenerateStationKey(
        stationIdentifier(selectedStation),
      );
      const stationKey = buildStationKey({
        ...response,
        uuid: selectedStation.uuid,
        id: selectedStation.id,
      });

      if (!stationKey) {
        throw new Error("La API no retorno una llave valida.");
      }

      setKeyModal({
        isOpen: true,
        title: `Nueva llave para ${selectedStation.name}`,
        stationKey,
      });
      setMessage("Llave regenerada correctamente.");
    } catch (regenerateError) {
      setError(regenerateError.message);
    }
  }

  async function handleDeleteStation() {
    if (!selectedStation || deleteConfirmation !== selectedStation.name) return;

    setError("");
    setMessage("");

    try {
      await deleteStation(stationIdentifier(selectedStation));
      setSelectedStation(null);
      setDeleteConfirmation("");
      await refreshStations();
      setMessage("Estacion eliminada correctamente.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleAdminDeleteStation() {
    if (
      !selectedAdminStation ||
      adminStationDeleteConfirmation !== selectedAdminStation.name
    )
      return;

    setError("");
    setMessage("");

    try {
      await deleteStation(stationIdentifier(selectedAdminStation));
      setSelectedAdminStation(null);
      setAdminStationDeleteConfirmation("");
      await refreshStations();
      setMessage("Estacion eliminada por admin.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function selectAdminStation(station) {
    setSelectedAdminStation(station);
    setAdminStationDeleteConfirmation("");
  }

  return {
    refreshStations,
    handleCreateStation,
    handleRegenerateKey,
    handleDeleteStation,
    handleAdminDeleteStation,
    selectAdminStation,
  };
}
