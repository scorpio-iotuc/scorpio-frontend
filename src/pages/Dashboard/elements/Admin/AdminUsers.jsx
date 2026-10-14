import { useDashboardContext } from "../../context/DashboardContext";
import Pagination from "../Pagination";

// AdminUsers view; shared state persists in the Dashboard provider.
export default function AdminUsers() {
  const {
    adminUsers,
    adminUserPagination,
    setAdminUserPage,
    selectedAdminUser,
    adminUserForm,
    adminUserDeleteConfirmation,
    setAdminUserDeleteConfirmation,
    isLoadingAdminUsers,
    isSavingAdminUser,
    createUserForm,
    isCreatingUser,
    handleAdminUserFormChange,
    handleCreateUserFormChange,
    handleAdminUpdateUser,
    handleCreateUser,
    handleAdminDeleteUser,
    selectAdminUser,
  } = useDashboardContext();

  return (
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
                className={`admin-list__item ${selectedAdminUser?.id === adminUser.id ? "admin-list__item--active" : ""}`}
                onClick={() => selectAdminUser(adminUser)}
              >
                <strong>{adminUser.name || adminUser.email}</strong>
                <span>{adminUser.email}</span>
                <small>{adminUser.type || "normal"}</small>
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
            <input
              name="name"
              value={adminUserForm.name}
              onChange={handleAdminUserFormChange}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={adminUserForm.email}
              onChange={handleAdminUserFormChange}
            />
          </label>
          <label>
            Type
            <select
              name="type"
              value={adminUserForm.type}
              onChange={handleAdminUserFormChange}
            >
              <option value="normal">normal</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label>
            New password
            <input
              name="password"
              type="password"
              value={adminUserForm.password}
              onChange={handleAdminUserFormChange}
              placeholder="Opcional"
            />
          </label>
          <button type="submit" disabled={isSavingAdminUser}>
            {isSavingAdminUser ? "Guardando..." : "Actualizar usuario"}
          </button>
        </form>
      )}

      {selectedAdminUser && (
        <div className="danger-zone">
          <h3>Delete user</h3>
          <p>
            Write <strong>{selectedAdminUser.email}</strong> to confirm.
          </p>
          <input
            value={adminUserDeleteConfirmation}
            onChange={(event) =>
              setAdminUserDeleteConfirmation(event.target.value)
            }
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
          <input
            name="name"
            value={createUserForm.name}
            onChange={handleCreateUserFormChange}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={createUserForm.email}
            onChange={handleCreateUserFormChange}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={createUserForm.password}
            onChange={handleCreateUserFormChange}
            required
          />
        </label>
        <label>
          Type
          <select
            name="type"
            value={createUserForm.type}
            onChange={handleCreateUserFormChange}
          >
            <option value="normal">normal</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <button type="submit" disabled={isCreatingUser}>
          {isCreatingUser ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </section>
  );
}
