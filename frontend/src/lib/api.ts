import type { Tab, Favorite, Notification, SearchResponse, Workspace, ApplicationAccess, UserAccessResponse, UserPreference } from "@/types/platform";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  workspaces: {
    list: () => fetchAPI<Workspace[]>("/api/v1/workspaces"),
    get: (id: string) => fetchAPI<Workspace>(`/api/v1/workspaces/${id}`),
    create: (ws: Partial<Workspace>) =>
      fetchAPI<Workspace>("/api/v1/workspaces", { method: "POST", body: JSON.stringify(ws) }),
    update: (id: string, ws: Partial<Workspace>) =>
      fetchAPI<Workspace>(`/api/v1/workspaces/${id}`, { method: "PUT", body: JSON.stringify(ws) }),
    delete: (id: string) =>
      fetchAPI<void>(`/api/v1/workspaces/${id}`, { method: "DELETE" }),
  },
  tabs: {
    list: (userId: string) => fetchAPI<Tab[]>(`/api/v1/tabs?user_id=${userId}`),
    create: (tab: Partial<Tab>) =>
      fetchAPI<Tab>("/api/v1/tabs", { method: "POST", body: JSON.stringify(tab) }),
    update: (id: string, tab: Partial<Tab>) =>
      fetchAPI<Tab>(`/api/v1/tabs/${id}`, { method: "PUT", body: JSON.stringify(tab) }),
    delete: (id: string) =>
      fetchAPI<void>(`/api/v1/tabs/${id}`, { method: "DELETE" }),
    sync: (userId: string, tabs: Tab[], activeTab: string) =>
      fetchAPI<void>("/api/v1/tabs/sync", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, tabs, active_tab: activeTab }),
      }),
  },
  favorites: {
    list: (userId: string) => fetchAPI<Favorite[]>(`/api/v1/favorites?user_id=${userId}`),
    create: (fav: Partial<Favorite>) =>
      fetchAPI<Favorite>("/api/v1/favorites", { method: "POST", body: JSON.stringify(fav) }),
    delete: (id: string) =>
      fetchAPI<void>(`/api/v1/favorites/${id}`, { method: "DELETE" }),
    reorder: (ids: string[]) =>
      fetchAPI<void>("/api/v1/favorites/reorder", { method: "POST", body: JSON.stringify({ ids }) }),
  },
  notifications: {
    list: (userId: string) => fetchAPI<Notification[]>(`/api/v1/notifications?user_id=${userId}`),
    markRead: (id: string) =>
      fetchAPI<Notification>(`/api/v1/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: (userId: string) =>
      fetchAPI<void>(`/api/v1/notifications/read-all?user_id=${userId}`, { method: "POST" }),
  },
  search: (q: string) => fetchAPI<SearchResponse>(`/api/v1/search?q=${encodeURIComponent(q)}`),
  preferences: {
    get: (userId: string) => fetchAPI<UserPreference>(`/api/v1/users/${userId}/preferences`),
    update: (userId: string, prefs: Partial<UserPreference>) =>
      fetchAPI<UserPreference>(`/api/v1/users/${userId}/preferences`, {
        method: "PUT",
        body: JSON.stringify(prefs),
      }),
  },
  access: {
    list: () => fetchAPI<ApplicationAccess[]>("/api/v1/application-access"),
    update: (appName: string, data: Partial<ApplicationAccess>) =>
      fetchAPI<ApplicationAccess>(`/api/v1/application-access/${appName}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getUserAccess: (userId: string) =>
      fetchAPI<UserAccessResponse>(`/api/v1/users/${userId}/access`),
  },
};
