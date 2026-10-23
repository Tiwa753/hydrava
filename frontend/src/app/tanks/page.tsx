'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { TankStatusGrid } from '@/components/dashboard/TankStatusGrid';
import { useDashboard } from '@/hooks/useDashboard';
import { Waves } from 'lucide-react';

export default function TanksPage() {
  const { data, isLoading, isConnected, isPolling, lastUpdated, refetch } = useDashboard();

  return (
    <PageWrapper
      title="Water Tanks"
      isConnected={isConnected}
      isPolling={isPolling}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/20 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-white">Monitored Vessels</h2>
              {data?.tanks && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                  {data.tanks.length} total
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Live capacity, sensor connectivity, and operational health of all registered tanks
            </p>
          </div>
        </div>

        <TankStatusGrid tanks={data?.tanks} isLoading={isLoading} />
      </div>
    </PageWrapper>
  );
}
