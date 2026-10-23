import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Droplet,
} from 'lucide-react';
import { Alert } from '@/types/water-monitoring';
import {
  cn,
  formatPercent,
  formatRelativeTime,
  getAlertTypeLabel,
} from '@/lib/utils';

export interface AlertListProps {
  alerts?: Alert[];
  isLoading?: boolean;
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
  showResolved?: boolean;
}

export function AlertList({
  alerts = [],
  isLoading = false,
  onAcknowledge,
  onResolve,
  showResolved = false,
}: AlertListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="hydrava-card p-4 border border-blue-900/20 animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-800 rounded" />
                <div className="h-3 w-32 bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Filter based on resolved state if requested
  const displayAlerts = showResolved
    ? alerts
    : alerts.filter((a) => !a.is_resolved);

  if (displayAlerts.length === 0) {
    return (
      <div className="hydrava-card p-12 flex flex-col items-center justify-center text-center border border-blue-900/20">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">No Active Alerts</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          All monitored water tanks and telemetry sensors are currently operating within normal parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => {
        const isCritical = alert.severity === 'critical';
        const isResolved = alert.is_resolved;
        const isAcknowledged = alert.is_acknowledged;

        return (
          <div
            key={alert.id}
            className={cn(
              'hydrava-card p-4 sm:p-5 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
              isResolved
                ? 'opacity-60 bg-slate-900/40 border-slate-800'
                : isCritical
                ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 to-[#111e38] glow-red'
                : 'border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-[#111e38]'
            )}
          >
            {/* Left section: Icon + Message */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0',
                  isCritical
                    ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400'
                    : 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                )}
              >
                {isCritical ? (
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-bold tracking-tight',
                      isCritical ? 'text-rose-400' : 'text-amber-400'
                    )}
                  >
                    {getAlertTypeLabel(alert.alert_type)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    Tank #{alert.tank_id}
                  </span>

                  {/* Status Chips */}
                  {isResolved ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600">
                      Resolved
                    </span>
                  ) : isAcknowledged ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      Acknowledged
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 font-medium">{alert.message}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className={cn(isResolved && 'line-through')}>
                      Detected {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>

                  {alert.last_reading_percent !== null && (
                    <div className="flex items-center gap-1 text-slate-300 font-mono">
                      <Droplet className="w-3.5 h-3.5 text-blue-400" />
                      <span>Reading: {formatPercent(alert.last_reading_percent)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section: Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {!isAcknowledged && !isResolved && onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/60 transition-colors"
                >
                  Acknowledge
                </button>
              )}

              {!isResolved && onResolve && (
                <button
                  onClick={() => onResolve(alert.id)}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
