import {
  Alert,
  DashboardResponse,
  Device,
  Reading,
  Tank,
} from '@/types/water-monitoring';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}/api/v1${normalizedPath}`;

  const defaultHeaders: HeadersInit = {
    Accept: 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && typeof errorJson === 'object' && 'detail' in errorJson) {
        errorMessage = String(errorJson.detail);
      } else if (errorJson && typeof errorJson === 'object' && 'message' in errorJson) {
        errorMessage = String(errorJson.message);
      }
    } catch {
      // response was not JSON, retain default error message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: () => fetchApi<DashboardResponse>('/dashboard/summary'),
  getTanks: () => fetchApi<Tank[]>('/tanks'),
  getTank: (id: number) => fetchApi<Tank>(`/tanks/${id}`),
  getTankReadings: (id: number, limit = 200, since_hours = 24) =>
    fetchApi<Reading[]>(`/tanks/${id}/readings?limit=${limit}&since_hours=${since_hours}`),
  getAlerts: (include_resolved = false) =>
    fetchApi<Alert[]>(`/alerts?include_resolved=${include_resolved}`),
  acknowledgeAlert: (
    id: number,
    data: { is_acknowledged?: boolean; is_resolved?: boolean }
  ) =>
    fetchApi<Alert>(`/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getDevices: () => fetchApi<Device[]>('/devices'),
  updateTankSettings: (id: number, data: Partial<Tank>) =>
    fetchApi<Tank>(`/tanks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getHealth: () => fetchApi<{ status: string; version?: string }>('/health'),
};
