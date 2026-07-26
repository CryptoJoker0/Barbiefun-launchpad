export type AdminSession = {
  authenticated: boolean;
};

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body as { error?: string }).error ?? `API ${response.status}`);
  }
  return body as T;
}

export function getAdminSession() {
  return adminFetch<AdminSession>("/admin/session");
}

export function loginAdmin(password: string) {
  return adminFetch<AdminSession>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function logoutAdmin() {
  return adminFetch<AdminSession>("/admin/logout", { method: "POST" });
}