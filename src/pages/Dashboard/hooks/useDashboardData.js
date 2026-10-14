import { useEffect } from "react";
import { getToken } from "../../../services/sessionService";
import { getStations } from "../../../services/stationService";
import { getUserById, getUsers } from "../../../services/userService";
import { PAGE_SIZE } from "../helper/dashboardUtils";

// Load authenticated data and ignore responses after cleanup.
export default function useDashboardData(state) {
  const {
    setStations,
    setSettingsForm,
    setUser,
    setIsLoading,
    setError,
    setAdminUsers,
    setAdminUserPagination,
    adminUserPage,
    setIsLoadingAdminUsers,
    userId,
    isAdmin,
  } = state;

  useEffect(() => {
    if (!getToken()) {
      window.location.assign("/login");
      return;
    }

    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const [stationData, userData] = await Promise.all([
          getStations(),
          userId ? getUserById(userId) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        setStations(stationData);
        setUser(userData);
        setSettingsForm({
          name: userData?.name || "",
          email: userData?.email || "",
          password: "",
        });
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [userId, setError, setIsLoading, setSettingsForm, setStations, setUser]);

  useEffect(() => {
    if (!isAdmin) return undefined;

    let isMounted = true;

    async function loadAdminUsers() {
      setIsLoadingAdminUsers(true);

      try {
        const { users, pagination } = await getUsers({
          page: adminUserPage,
          limit: PAGE_SIZE,
        });

        if (!isMounted) return;

        setAdminUsers(users);
        setAdminUserPagination({
          page: pagination.page || adminUserPage,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || users.length,
        });
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAdminUsers(false);
        }
      }
    }

    loadAdminUsers();

    return () => {
      isMounted = false;
    };
  }, [
    adminUserPage,
    isAdmin,
    setAdminUserPagination,
    setAdminUsers,
    setError,
    setIsLoadingAdminUsers,
  ]);
}
