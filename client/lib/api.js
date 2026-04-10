const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("shoffr_token");
}

export function setToken(t) {
  localStorage.setItem("shoffr_token", t);
}

export function clearToken() {
  localStorage.removeItem("shoffr_token");
}

async function request(path, opts = {}) {
  const headers = { ...opts.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";
  const r = await fetch(`${API}${path}`, { ...opts, headers });
  const text = await r.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!r.ok) throw new Error(data?.error || r.statusText || "Request failed");
  return data;
}

export const api = {
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/me"),
  trips: () => request("/api/trips"),
  trip: (id) => request(`/api/trips/${id}`),
  createTrip: (body) =>
    request("/api/trips", { method: "POST", body: JSON.stringify(body) }),
  tripStatus: (id, status) =>
    request(`/api/trips/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  dismissLostPrompt: (tripId) =>
    request(`/api/trips/${tripId}/dismiss-lost-prompt`, { method: "POST" }),
  lostItemPrompt: () => request("/api/prompts/lost-item"),
  lostItems: () => request("/api/lost-items"),
  lostItem: (id) => request(`/api/lost-items/${id}`),
  createLostItem: (body) =>
    request("/api/lost-items", { method: "POST", body: JSON.stringify(body) }),
  patchLostItem: (id, body) =>
    request(`/api/lost-items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  recoveryRequests: (lostItemId) =>
    request(
      `/api/recovery-requests${lostItemId ? `?lost_item_id=${encodeURIComponent(lostItemId)}` : ""}`
    ),
  createRecovery: (body) =>
    request("/api/recovery-requests", { method: "POST", body: JSON.stringify(body) }),
  driverLostItems: () => request("/api/driver/lost-items"),
};
