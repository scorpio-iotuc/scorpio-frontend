import { createContext, useContext } from "react";

// Views consume Dashboard data without passing props through layout components.
export const DashboardContext = createContext(null);

export function useDashboardContext() {
  const dashboard = useContext(DashboardContext);
  if (!dashboard) throw new Error("Dashboard views require DashboardContext.");
  return dashboard;
}
