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
    list: () => fetchAPI("/api/v1/workspaces"),
    get: (id: string) => fetchAPI(`/api/v1/workspaces/${id}`),
  },
  tabs: {
    list: (userId: string) => fetchAPI(`/api/v1/tabs?user_id=${userId}`),
  },
  favorites: {
    list: (userId: string) => fetchAPI(`/api/v1/favorites?user_id=${userId}`),
  },
  notifications: {
    list: (userId: string) => fetchAPI(`/api/v1/notifications?user_id=${userId}`),
    markRead: (id: string) => fetchAPI(`/api/v1/notifications/${id}/read`, { method: "PATCH" }),
  },
  search: (q: string) => fetchAPI(`/api/v1/search?q=${encodeURIComponent(q)}`),
  preferences: {
    get: (userId: string) => fetchAPI(`/api/v1/users/${userId}/preferences`),
  },
};
