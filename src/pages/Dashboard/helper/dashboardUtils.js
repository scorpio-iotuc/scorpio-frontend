// Defaults and pure transformations shared by Dashboard modules.
export const PAGE_SIZE = 5;

export const initialStationForm = {
  name: "",
  latitude: "",
  longitude: "",
  altitude: "",
};

export const initialSettingsForm = {
  name: "",
  email: "",
  password: "",
};

export const initialAdminUserForm = {
  name: "",
  email: "",
  type: "normal",
  password: "",
};

export const initialCreateUserForm = {
  name: "",
  email: "",
  password: "",
  type: "normal",
};

export function isOnline(station) {
  return station?.status === true || station?.status === "online";
}

export function stationIdentifier(station) {
  return station?.uuid || station?.id;
}

export function buildStationKey(response) {
  const stationId =
    response?.stationId ||
    response?.stationUuid ||
    response?.uuid ||
    response?.station?.uuid ||
    response?.id;
  const ownerKey = response?.ownerKey;

  if (response?.stationKey) return response.stationKey;
  if (stationId && ownerKey) return `${stationId}.${ownerKey}`;
  return ownerKey || "";
}

export function formatCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(5) : "N/A";
}

export function clampPage(page, totalPages) {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = clampPage(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    total: items.length,
    items: items.slice(start, start + pageSize),
  };
}
