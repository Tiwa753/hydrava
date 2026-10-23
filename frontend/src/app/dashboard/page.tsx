'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TankStatusGrid } from '@/components/dashboard/TankStatusGrid';
import { OfflineState } from '@/components/ui/OfflineState';
import { useDashboard } from '@/hooks/useDashboard';
import { isStale, formatRelativeTime } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const {
    data,
    isLoading,
    error,
    isConnected,
    isPolling,
    lastUpdated,
    refetch,
  } = useDashboard();

  const isDataStale = lastUpdated ? isStale(lastUpdated.toISOString(), 30) : false;

  return (
    <PageWrapper
      title="Dashboard Overview"
      isConnected={isConnected}
      isPolling={isPolling}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
    >
      {/* If severe error and no data at all, show OfflineState */}
      {error && !data && !isLoading ? (
        <OfflineState
          title="Telemetry Feed Disconnected"
          message={error}
          onRetry={refetch}
          lastKnownAt={lastUpdated ? lastUpdated.toISOString() : null}
        />
      ) : (
        <div className="space-y-8">
          {/* Header intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-900/20 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Water Level Overview
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time telemetry and threshold tracking across all monitored storage vessels
              </p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Last packet: {formatRelativeTime(lastUpdated.toISOString())}</span>
              </div>
            )}
          </div>

          {/* Stale Warning Banner */}
          {isDataStale && !isLoading && data && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 animate-pulse" />
              <div>
                <span className="font-semibold">Stale Telemetry Warning:</span> No new
                telemetry updates have been received for over 30 seconds. Verify that sensor
                gateways and simulated devices are operational.
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <SummaryCards summary={data?.summary} isLoading={isLoading} />

          {/* Tanks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-200">
                  Storage Vessels
                </h3>
                {data?.tanks && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    {data.tanks.length} total
                  </span>
                )}
              </div>
            </div>

            <TankStatusGrid tanks={data?.tanks} isLoading={isLoading} />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
