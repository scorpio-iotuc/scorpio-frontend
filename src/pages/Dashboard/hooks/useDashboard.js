import useDashboardState from "./useDashboardState";
import useDashboardData from "./useDashboardData";
import useStationActions from "./useStationActions";
import useAdminUserActions from "./useAdminUserActions";
import useAccountActions from "./useAccountActions";
import useFormChange from "./useFormChange";

// Compose persistent state and domain actions for every view.
export default function useDashboard() {
  const state = useDashboardState();
  useDashboardData(state);
  const stationActions = useStationActions(state);
  const adminActions = useAdminUserActions(state);
  const accountActions = useAccountActions(state);
  const handleStationFormChange = useFormChange(state.setStationForm);
  const handleSettingsChange = useFormChange(state.setSettingsForm);
  const handleAdminUserFormChange = useFormChange(state.setAdminUserForm);
  const handleCreateUserFormChange = useFormChange(state.setCreateUserForm);

  return {
    ...state,
    ...stationActions,
    ...adminActions,
    ...accountActions,
    handleStationFormChange,
    handleSettingsChange,
    handleAdminUserFormChange,
    handleCreateUserFormChange,
  };
}
