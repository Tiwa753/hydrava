'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { DashboardResponse } from '@/types/water-monitoring';

const REFRESH_INTERVAL_MS = 5000;

export function useDashboard() {
  const { data: liveData, isConnected } = useWebSocket();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasLoaded = useRef(false);

  const fetchDashboard = useCallback(async () => {
    if (!hasLoaded.current) {
      setIsLoading(true);
    }

    try {
      const response = await api.getDashboard();
      setData(response);
      setLastUpdated(new Date());
      hasLoaded.current = true;
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load dashboard data.'
      );
    } finally {
      hasLoaded.current = true;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!liveData) return;

    setData(liveData);
    setLastUpdated(new Date());
    hasLoaded.current = true;
    setError(null);
    setIsLoading(false);
  }, [liveData]);

  useEffect(() => {
    if (isConnected) return;

    const interval = window.setInterval(() => {
      void fetchDashboard();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchDashboard, isConnected]);

  return {
    data,
    isLoading,
    error,
    isConnected,
    isPolling: !isConnected && !error,
    lastUpdated,
    refetch: fetchDashboard,
  };
}
