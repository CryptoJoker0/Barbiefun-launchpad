export type LiveStreamSettings = {
  id: string;
  isLive: boolean;
  title: string;
  embedUrl: string | null;
  goLiveUrl: string | null;
  videoObjectPath: string | null;
  videoTitle: string | null;
  updatedAt: string;
};

const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getLiveStreamSettings() {
  return apiFetch<LiveStreamSettings>("/live-stream");
}

export type UpdateLiveStreamSettings = Omit<
  LiveStreamSettings,
  "id" | "updatedAt"
>;

export function updateLiveStreamSettings(settings: UpdateLiveStreamSettings) {
  return apiFetch<LiveStreamSettings>("/live-stream", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}