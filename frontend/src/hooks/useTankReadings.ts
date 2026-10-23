// DEMO MODE: All hooks return static mock data instantly.

import { MOCK_READINGS, MOCK_TANK, MOCK_ALERTS, MOCK_DEVICE } from '@/lib/mock-data';
import type { Reading, Tank, Alert, Device } from '@/types/water-monitoring';

export function useTankReadings(tankId: number, sinceHours: number = 24) {
  // Filter mock readings to match the requested time window
  const cutoff = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
  const readings = MOCK_READINGS.filter(
    (r) => new Date(r.received_at) >= cutoff
  );
  return { readings, isLoading: false, error: null, refetch: () => {} };
}

export function useTankDetail(tankId: number) {
  return { tank: MOCK_TANK as Tank, isLoading: false, error: null, refetch: () => {} };
}

export function useAlerts(includeResolved: boolean = false) {
  const alerts = includeResolved
    ? MOCK_ALERTS
    : MOCK_ALERTS.filter((a) => !a.is_resolved);
  return {
    alerts: alerts as Alert[],
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}

export function useDevices() {
  return { devices: [MOCK_DEVICE] as Device[], isLoading: false, error: null, refetch: () => {} };
}
