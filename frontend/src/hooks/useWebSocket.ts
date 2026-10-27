'use client';

import { useEffect, useState } from 'react';
import { DashboardWebSocket } from '@/lib/websocket';
import type { DashboardResponse } from '@/types/water-monitoring';

export function useWebSocket() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const websocket = new DashboardWebSocket(setData, setIsConnected);
    websocket.connect();

    return () => websocket.disconnect();
  }, []);

  return { data, isConnected };
}
