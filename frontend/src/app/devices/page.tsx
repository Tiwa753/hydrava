'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDevices } from '@/hooks/useTankReadings';
import { api } from '@/lib/api';
import { Tank } from '@/types/water-monitoring';
import { cn, formatPercent, formatRelativeTime } from '@/lib/utils';
import { Cpu, Wifi, WifiOff, Radio, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DevicesPage() {
  const { devices, isLoading, error, refetch } = useDevices();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [tanksError, setTanksError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTanks = async () => {
      try {
        const response = await api.getTanks();
        if (isMounted) {
          setTanks(response);
          setTanksError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setTanksError(
            fetchError instanceof Error ? fetchError.message : 'Unable to load tanks.'
          );
        }
      }
    };

    void fetchTanks();
    const interval = window.setInterval(() => {
      void fetchTanks();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const getTankInfo = (tankId: number) => {
    return tanks.find((t) => t.id === tankId);
  };

  const renderRssiSignal = (rssi: number | null | undefined) => {
    if (rssi === null || rssi === undefined) {
      return <span className="text-slate-500 font-mono text-xs">N/A</span>;
    }

    let bars = 1;
    let label = 'Poor';
    let color = 'bg-rose-500 text-rose-400';

    if (rssi >= -50) {
      bars = 4;
      label = 'Excellent';
      color = 'bg-emerald-400 text-emerald-400';
    } else if (rssi >= -65) {
      bars = 3;
      label = 'Good';
      color = 'bg-teal-400 text-teal-400';
    } else if (rssi >= -78) {
      bars = 2;
      label = 'Fair';
      color = 'bg-amber-400 text-amber-400';
    } else {
      bars = 1;
      label = 'Weak';
      color = 'bg-rose-400 text-rose-400';
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-3.5">
          <div className={cn('w-1 rounded-sm', bars >= 1 ? color.split(' ')[0] : 'bg-slate-700', 'h-1')} />
          <div className={cn('w-1 rounded-sm', bars >= 2 ? color.split(' ')[0] : 'bg-slate-700', 'h-2')} />
          <div className={cn('w-1 rounded-sm', bars >= 3 ? color.split(' ')[0] : 'bg-slate-700', 'h-2.5')} />
          <div className={cn('w-1 rounded-sm', bars >= 4 ? color.split(' ')[0] : 'bg-slate-700', 'h-3.5')} />
        </div>
        <span className={cn('text-xs font-mono font-medium', color.split(' ')[1])}>
          {rssi} dBm <span className="text-[10px] text-slate-400">({label})</span>
        </span>
      </div>
    );
  };

  return (
    <PageWrapper title="Device Management" onRefresh={refetch}>
      <div className="space-y-6">
        {(error || tanksError) && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error || tanksError}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/20 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-white">IoT Devices</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                {devices.length} registered
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Active telemetry gateways, Wi-Fi connectivity status, and transmitter metrics
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && devices.length === 0 ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <LoadingSpinner size="lg" label="Querying IoT device gateways..." />
          </div>
        ) : devices.length === 0 ? (
          <div className="hydrava-card p-12 text-center border border-blue-900/20 max-w-lg mx-auto">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No Devices Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Ensure device simulators or hardware nodes are actively publishing to the Hydrava backend.
            </p>
          </div>
        ) : (
          <div className="hydrava-card border border-blue-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-blue-900/30 bg-[#0d1528]/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Device ID</th>
                    <th className="py-3.5 px-4">Assigned Tank</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Seen</th>
                    <th className="py-3.5 px-4">Latest Level</th>
                    <th className="py-3.5 px-4">Wi-Fi RSSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/20 text-slate-300">
                  {devices.map((device) => {
                    const assignedTank = getTankInfo(device.tank_id);
                    const latestReading = assignedTank?.latest_reading;
                    const isOnline = device.is_online;
                    const statusLabel = device.last_seen_at
                      ? isOnline
                        ? 'Online'
                        : 'Offline'
                      : 'Unknown';

                    return (
                      <tr
                        key={device.id}
                        className="hover:bg-slate-800/30 transition-colors duration-150"
                      >
                        {/* Device ID */}
                        <td className="py-4 px-4 font-mono font-medium text-blue-400 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-slate-500" />
                          <span>{device.device_id}</span>
                        </td>

                        {/* Assigned Tank */}
                        <td className="py-4 px-4 font-medium text-slate-200">
                          {assignedTank ? (
                            <div>
                              <span>{assignedTank.name}</span>
                              <div className="text-xs text-slate-500">{assignedTank.location}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">
                              Tank #{device.tank_id}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              isOnline
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                              )}
                            />
                            <span>{statusLabel}</span>
                          </span>
                        </td>

                        {/* Last Seen */}
                        <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                          {formatRelativeTime(device.last_seen_at)}
                        </td>

                        {/* Latest Level */}
                        <td className="py-4 px-4 font-mono font-bold text-white text-xs">
                          {latestReading ? formatPercent(latestReading.water_level_percent) : '--'}
                        </td>

                        {/* Wi-Fi RSSI */}
                        <td className="py-4 px-4">
                          {renderRssiSignal(latestReading?.wifi_rssi ?? -55)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
