import "./Admin.css";
import AdminUsers from "./AdminUsers";
import AdminStations from "./AdminStations";

// Admin view; shared state persists in the Dashboard provider.
export default function Admin() {
  return (
    <section className="dashboard-panel admin-panel">
      <div className="dashboard-panel__header">
        <div>
          <p>Admin operations</p>
          <h2>Users and stations</h2>
        </div>
      </div>

      <div className="admin-grid">
        <AdminUsers />
        <AdminStations />
      </div>
    </section>
  );
}
