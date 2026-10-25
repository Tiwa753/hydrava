'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Alert, Device, Reading, Tank } from '@/types/water-monitoring';

const REFRESH_INTERVAL_MS = 5000;

export function useTankReadings(tankId: number, sinceHours: number = 24) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = useCallback(async () => {
    if (!tankId) {
      setReadings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getTankReadings(tankId, 5000, sinceHours);
      setReadings(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load tank readings.'
      );
      setReadings([]);
    } finally {
      setIsLoading(false);
    }
  }, [sinceHours, tankId]);

  useEffect(() => {
    void fetchReadings();
    const interval = window.setInterval(() => {
      void fetchReadings();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchReadings]);

  return { readings, isLoading, error, refetch: fetchReadings };
}

export function useTankDetail(tankId: number) {
  const [tank, setTank] = useState<Tank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTank = useCallback(async () => {
    if (!tankId) {
      setTank(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getTank(tankId);
      setTank(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load tank details.'
      );
      setTank(null);
    } finally {
      setIsLoading(false);
    }
  }, [tankId]);

  useEffect(() => {
    void fetchTank();
    const interval = window.setInterval(() => {
      void fetchTank();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchTank]);

  return { tank, isLoading, error, refetch: fetchTank };
}

export function useAlerts(includeResolved: boolean = false) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getAlerts(includeResolved);
      setAlerts(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load alerts.'
      );
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [includeResolved]);

  useEffect(() => {
    void fetchAlerts();
    const interval = window.setInterval(() => {
      void fetchAlerts();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, isLoading, error, refetch: fetchAlerts };
}

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getDevices();
      setDevices(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load devices.'
      );
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDevices();
    const interval = window.setInterval(() => {
      void fetchDevices();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchDevices]);

  return { devices, isLoading, error, refetch: fetchDevices };
}
