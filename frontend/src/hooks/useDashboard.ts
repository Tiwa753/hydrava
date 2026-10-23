// DEMO MODE: All hooks return static mock data instantly — no API calls, no polling.
// To re-enable live data, replace these with the real API hooks in lib/api.ts.

import { MOCK_DASHBOARD, MOCK_READINGS, MOCK_TANK, MOCK_ALERTS, MOCK_DEVICE } from '@/lib/mock-data';
import type { DashboardResponse, Reading, Tank, Alert, Device } from '@/types/water-monitoring';

export function useDashboard() {
  return {
    data: MOCK_DASHBOARD as DashboardResponse,
    isLoading: false,
    error: null,
    isConnected: false,
    isPolling: false,
    lastUpdated: new Date(),
    refetch: () => {},
  };
}
