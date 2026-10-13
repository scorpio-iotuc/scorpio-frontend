import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../services/userService";
import {
  PAGE_SIZE,
  initialAdminUserForm,
  initialCreateUserForm,
} from "../helper/dashboardUtils";

// Encapsulate this domain’s mutations and preserve shared feedback.
export default function useAdminUserActions(state) {
  const {
    setMessage,
    setError,
    setAdminUsers,
    setAdminUserPagination,
    adminUserPage,
    selectedAdminUser,
    setSelectedAdminUser,
    adminUserForm,
    setAdminUserForm,
    adminUserDeleteConfirmation,
    setAdminUserDeleteConfirmation,
    setIsSavingAdminUser,
    createUserForm,
    setCreateUserForm,
    setIsCreatingUser,
  } = state;

  async function refreshAdminUsers() {
    const { users, pagination } = await getUsers({
      page: adminUserPage,
      limit: PAGE_SIZE,
    });
    setAdminUsers(users);
    setAdminUserPagination({
      page: pagination.page || adminUserPage,
      totalPages: pagination.totalPages || 1,
      total: pagination.total || users.length,
    });
  }

  async function handleAdminUpdateUser(event) {
    event.preventDefault();
    if (!selectedAdminUser) return;

    setIsSavingAdminUser(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: adminUserForm.name.trim(),
        email: adminUserForm.email.trim(),
      };

      if (adminUserForm.type !== selectedAdminUser.type) {
        payload.type = adminUserForm.type;
      }

      if (adminUserForm.password) {
        payload.password = adminUserForm.password;
      }

      const updatedUser = await updateUser(selectedAdminUser.id, payload);
      setSelectedAdminUser(updatedUser);
      setAdminUserForm({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        type: updatedUser?.type || "normal",
        password: "",
      });
      await refreshAdminUsers();
      setMessage("Usuario actualizado.");
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setIsSavingAdminUser(false);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setIsCreatingUser(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: createUserForm.name.trim(),
        email: createUserForm.email.trim(),
        password: createUserForm.password,
        type: createUserForm.type,
      };

      await createUser(payload);
      setCreateUserForm(initialCreateUserForm);
      await refreshAdminUsers();
      setMessage("Usuario creado correctamente.");
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function handleAdminDeleteUser() {
    if (
      !selectedAdminUser ||
      adminUserDeleteConfirmation !== selectedAdminUser.email
    )
      return;

    setError("");
    setMessage("");

    try {
      await deleteUser(selectedAdminUser.id);
      setSelectedAdminUser(null);
      setAdminUserForm(initialAdminUserForm);
      setAdminUserDeleteConfirmation("");
      await refreshAdminUsers();
      setMessage("Usuario eliminado.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function selectAdminUser(nextUser) {
    setSelectedAdminUser(nextUser);
    setAdminUserDeleteConfirmation("");
    setAdminUserForm({
      name: nextUser?.name || "",
      email: nextUser?.email || "",
      type: nextUser?.type || "normal",
      password: "",
    });
  }

  return {
    refreshAdminUsers,
    handleAdminUpdateUser,
    handleCreateUser,
    handleAdminDeleteUser,
    selectAdminUser,
  };
}
