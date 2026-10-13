import { useMemo, useState } from "react";
import { getCurrentUserId } from "../../../services/sessionService";
import {
  initialStationForm,
  initialSettingsForm,
  initialAdminUserForm,
  initialCreateUserForm,
  paginate,
} from "../helper/dashboardUtils";

// Keep view state mounted when switching tabs, including unsaved forms.
export default function useDashboardState() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationForm, setStationForm] = useState(initialStationForm);
  const [settingsForm, setSettingsForm] = useState(initialSettingsForm);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("stations");
  const [stationPage, setStationPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [accountDeleteConfirmation, setAccountDeleteConfirmation] =
    useState("");
  const [keyModal, setKeyModal] = useState({
    isOpen: false,
    title: "",
    stationKey: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStation, setIsSavingStation] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUserPagination, setAdminUserPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [adminUserPage, setAdminUserPage] = useState(1);
  const [adminStationPage, setAdminStationPage] = useState(1);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [adminUserForm, setAdminUserForm] = useState(initialAdminUserForm);
  const [adminUserDeleteConfirmation, setAdminUserDeleteConfirmation] =
    useState("");
  const [selectedAdminStation, setSelectedAdminStation] = useState(null);
  const [adminStationDeleteConfirmation, setAdminStationDeleteConfirmation] =
    useState("");
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [isSavingAdminUser, setIsSavingAdminUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(initialCreateUserForm);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const userId = useMemo(() => getCurrentUserId(), []);
  const isAdmin = user?.type === "admin";
  const userStations = useMemo(() => {
    if (!userId) return stations;

    return stations.filter(
      (station) =>
        !station.ownerId || Number(station.ownerId) === Number(userId),
    );
  }, [stations, userId]);
  const paginatedUserStations = useMemo(
    () => paginate(userStations, stationPage),
    [userStations, stationPage],
  );
  const paginatedAdminStations = useMemo(
    () => paginate(stations, adminStationPage),
    [stations, adminStationPage],
  );

  return {
    stations,
    setStations,
    selectedStation,
    setSelectedStation,
    stationForm,
    setStationForm,
    settingsForm,
    setSettingsForm,
    user,
    setUser,
    activeTab,
    setActiveTab,
    stationPage,
    setStationPage,
    deleteConfirmation,
    setDeleteConfirmation,
    accountDeleteConfirmation,
    setAccountDeleteConfirmation,
    keyModal,
    setKeyModal,
    isLoading,
    setIsLoading,
    isSavingStation,
    setIsSavingStation,
    isSavingUser,
    setIsSavingUser,
    message,
    setMessage,
    error,
    setError,
    adminUsers,
    setAdminUsers,
    adminUserPagination,
    setAdminUserPagination,
    adminUserPage,
    setAdminUserPage,
    adminStationPage,
    setAdminStationPage,
    selectedAdminUser,
    setSelectedAdminUser,
    adminUserForm,
    setAdminUserForm,
    adminUserDeleteConfirmation,
    setAdminUserDeleteConfirmation,
    selectedAdminStation,
    setSelectedAdminStation,
    adminStationDeleteConfirmation,
    setAdminStationDeleteConfirmation,
    isLoadingAdminUsers,
    setIsLoadingAdminUsers,
    isSavingAdminUser,
    setIsSavingAdminUser,
    createUserForm,
    setCreateUserForm,
    isCreatingUser,
    setIsCreatingUser,
    userId,
    isAdmin,
    userStations,
    paginatedUserStations,
    paginatedAdminStations,
  };
}
