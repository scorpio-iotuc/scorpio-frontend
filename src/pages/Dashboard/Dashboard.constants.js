import MyStations from "./elements/MyStations/MyStations";
import NewStation from "./elements/NewStation/NewStation";
import Settings from "./elements/Settings/Settings";
import Admin from "./elements/Admin/Admin";
import Jobs from "./elements/Jobs/Jobs";

// Register new views here; adminOnly gates both navigation and rendering.
export const dashboardViews = [
  { id: "stations", label: "My stations", component: MyStations },
  { id: "new-station", label: "New station", component: NewStation },
  { id: "settings", label: "Settings", component: Settings },
  { id: "admin", label: "Admin", component: Admin, adminOnly: true },
  { id: "jobs", label: "Jobs", component: Jobs, adminOnly: true },
];
