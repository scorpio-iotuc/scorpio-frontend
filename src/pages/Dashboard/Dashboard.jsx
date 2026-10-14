import useDashboard from "./hooks/useDashboard";
import { DashboardContext } from "./context/DashboardContext";
import { dashboardViews } from "./Dashboard.constants";
import "./Dashboard.css";

// The shell owns layout; registered views own their individual content.
export default function Dashboard() {
  const dashboard = useDashboard();
  const {
    user,
    isAdmin,
    activeTab,
    setActiveTab,
    logout,
    message,
    error,
    keyModal,
    setKeyModal,
    copyStationKey,
  } = dashboard;
  const navItems = dashboardViews.filter((view) => !view.adminOnly || isAdmin);
  const ActiveView = navItems.find((view) => view.id === activeTab)?.component;

  return (
    <DashboardContext.Provider value={dashboard}>
      <main className="dashboard-page">
        <header className="dashboard-topbar">
          <a href="/" className="dashboard-brand">
            SCORPIO
          </a>
          <div>
            <p>{user?.name || "Operador"}</p>
            <button type="button" onClick={logout}>
              Salir
            </button>
          </div>
        </header>

        <section className="dashboard-shell">
          <aside
            className="dashboard-sidebar"
            aria-label="Dashboard navigation"
          >
            <div>
              <p>Operator console</p>
            </div>

            <nav>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    activeTab === item.id
                      ? "dashboard-sidebar__item--active"
                      : ""
                  }
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="dashboard-workspace">
            {ActiveView && <ActiveView />}
          </section>
        </section>

        {(message || error) && (
          <div
            className={`dashboard-toast ${error ? "dashboard-toast--error" : ""}`}
            role="status"
          >
            {error || message}
          </div>
        )}

        {keyModal.isOpen && (
          <div
            className="key-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="station-key-title"
          >
            <div className="key-modal__content">
              <p>Station authentication key</p>
              <h2 id="station-key-title">{keyModal.title}</h2>
              <code>{keyModal.stationKey}</code>
              <p>
                This key is shown only once. Store it securely to authenticate
                your stations when they send packets to SCORPIO.
              </p>
              <div className="key-modal__actions">
                <button type="button" onClick={copyStationKey}>
                  Copy key
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setKeyModal({ isOpen: false, title: "", stationKey: "" })
                  }
                >
                  I already saved it
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardContext.Provider>
  );
}
