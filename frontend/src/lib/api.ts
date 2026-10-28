import {
  Alert,
  DashboardResponse,
  Device,
  Reading,
  Tank,
} from '@/types/water-monitoring';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname);
}

function resolveBrowserHost(url: URL): URL {
  if (
    typeof window !== 'undefined' &&
    isLocalHost(url.hostname) &&
    !isLocalHost(window.location.hostname)
  ) {
    url.hostname = window.location.hostname;
  }
  return url;
}

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return resolveBrowserHost(new URL(configuredUrl)).toString().replace(/\/+$/, '');
}

export function getWebSocketBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!configuredUrl) return getApiBaseUrl().replace(/^http/, 'ws');

  return resolveBrowserHost(new URL(configuredUrl)).toString().replace(/\/+$/, '');
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface StaffAuthResponse {
  staff_id: string;
  name: string;
  role: 'supervisor' | 'admin';
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${getApiBaseUrl()}/api/v1${normalizedPath}`;

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
    throw new ApiError(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  registerStaff: (data: { staff_id: string; full_name: string; password: string }) =>
    fetchApi<StaffAuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  loginStaff: (data: { staff_id: string; password: string }) =>
    fetchApi<StaffAuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
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
