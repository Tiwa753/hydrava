'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AlertList } from '@/components/alerts/AlertList';
import { useAlerts } from '@/hooks/useTankReadings';
import { api } from '@/lib/api';
import { Bell, Filter, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'critical'>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const { alerts, isLoading, error, refetch } = useAlerts(showResolved);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (severityFilter !== 'all' && alert.severity !== severityFilter) {
        return false;
      }
      return true;
    });
  }, [alerts, severityFilter]);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id, { is_acknowledged: true });
      setActionError(null);
      refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to acknowledge alert.');
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.acknowledgeAlert(id, { is_resolved: true });
      setActionError(null);
      refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to resolve alert.');
    }
  };

  const activeCount = useMemo(() => alerts.filter((a) => !a.is_resolved).length, [alerts]);
  const criticalCount = useMemo(
    () => alerts.filter((a) => a.severity === 'critical' && !a.is_resolved).length,
    [alerts]
  );

  return (
    <PageWrapper title="System Alerts" onRefresh={refetch}>
      <div className="space-y-6">
        {/* Header & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/20 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-white">Alert Log</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
                {activeCount} Active
              </span>
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white animate-pulse">
                  {criticalCount} Critical
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Real-time monitoring event triggers, overflow warnings, and low-level hazards
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Show Active vs All Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-blue-900/30">
              <button
                onClick={() => setShowResolved(false)}
                type="button"
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  !showResolved
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                Active Only
              </button>
              <button
                onClick={() => setShowResolved(true)}
                type="button"
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  showResolved
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                All Alerts
              </button>
            </div>

            {/* Severity Filter Dropdown or Button Group */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-blue-900/30">
              <button
                onClick={() => setSeverityFilter('all')}
                type="button"
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  severityFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                All
              </button>
              <button
                onClick={() => setSeverityFilter('warning')}
                type="button"
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  severityFilter === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-400'
                )}
              >
                Warning
              </button>
              <button
                onClick={() => setSeverityFilter('critical')}
                type="button"
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  severityFilter === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-rose-400'
                )}
              >
                Critical
              </button>
            </div>
          </div>
        </div>

        {(error || actionError) && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {actionError || error}
          </div>
        )}

        {/* Alerts List */}
        <AlertList
          alerts={filteredAlerts}
          isLoading={isLoading}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          showResolved={showResolved}
        />
      </div>
    </PageWrapper>
  );
}
