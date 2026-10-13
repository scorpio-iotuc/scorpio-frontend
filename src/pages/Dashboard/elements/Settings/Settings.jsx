import "./Settings.css";
import { useDashboardContext } from "../../context/DashboardContext";

// Settings view; shared state persists in the Dashboard provider.
export default function Settings() {
  const {
    settingsForm,
    accountDeleteConfirmation,
    setAccountDeleteConfirmation,
    isSavingUser,
    handleSettingsChange,
    handleUpdateUser,
    handleDeleteAccount,
  } = useDashboardContext();

  return (
    <section className="dashboard-panel settings-panel">
      <div className="dashboard-panel__header">
        <div>
          <p>User settings</p>
          <h2>Settings</h2>
        </div>
      </div>

      <form
        className="dashboard-form dashboard-form--narrow"
        onSubmit={handleUpdateUser}
      >
        <label>
          Name
          <input
            name="name"
            value={settingsForm.name}
            onChange={handleSettingsChange}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={settingsForm.email}
            onChange={handleSettingsChange}
          />
        </label>
        <label>
          New password
          <input
            name="password"
            type="password"
            value={settingsForm.password}
            onChange={handleSettingsChange}
            placeholder="Opcional"
          />
        </label>
        <button type="submit" disabled={isSavingUser}>
          {isSavingUser ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="danger-zone danger-zone--narrow">
        <h3>Delete account</h3>
        <p>Enter your email to confirm.</p>
        <input
          value={accountDeleteConfirmation}
          onChange={(event) => setAccountDeleteConfirmation(event.target.value)}
          placeholder={settingsForm.email || "email"}
        />
        <button
          type="button"
          disabled={accountDeleteConfirmation !== settingsForm.email}
          onClick={handleDeleteAccount}
        >
          Delete account
        </button>
      </div>
    </section>
  );
}
