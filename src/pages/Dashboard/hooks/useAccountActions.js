import { updateUser, deleteUser } from "../../../services/userService";
import { clearSession } from "../../../services/sessionService";

// Encapsulate this domain’s mutations and preserve shared feedback.
export default function useAccountActions(state) {
  const {
    settingsForm,
    setSettingsForm,
    setUser,
    accountDeleteConfirmation,
    keyModal,
    setIsSavingUser,
    setMessage,
    setError,
    userId,
  } = state;

  async function handleUpdateUser(event) {
    event.preventDefault();
    if (!userId) return;

    setIsSavingUser(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: settingsForm.name.trim(),
        email: settingsForm.email.trim(),
      };

      if (settingsForm.password) {
        payload.password = settingsForm.password;
      }

      const updatedUser = await updateUser(userId, payload);
      setUser(updatedUser);
      setSettingsForm((current) => ({ ...current, password: "" }));
      setMessage("Configuracion actualizada.");
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setIsSavingUser(false);
    }
  }

  async function handleDeleteAccount() {
    if (!userId || accountDeleteConfirmation !== settingsForm.email) return;

    setError("");
    setMessage("");

    try {
      await deleteUser(userId);
      clearSession();
      window.location.assign("/login");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function copyStationKey() {
    await navigator.clipboard.writeText(keyModal.stationKey);
    setMessage("Llave copiada al portapapeles.");
  }

  function logout() {
    clearSession();
    window.location.assign("/login");
  }

  return { handleUpdateUser, handleDeleteAccount, copyStationKey, logout };
}
