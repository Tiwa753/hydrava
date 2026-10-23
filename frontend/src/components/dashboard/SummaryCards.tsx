import { Droplets, AlertOctagon, CheckCircle, WifiOff } from 'lucide-react';
import { DashboardSummary } from '@/types/water-monitoring';
import { cn } from '@/lib/utils';

export interface SummaryCardsProps {
  summary?: DashboardSummary | null;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading = false }: SummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="hydrava-card p-5 border border-blue-900/20 animate-pulse flex flex-col justify-between h-[128px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-800 rounded" />
              <div className="h-10 w-10 bg-slate-800 rounded-xl" />
            </div>
            <div>
              <div className="h-8 w-16 bg-slate-800 rounded mb-1" />
              <div className="h-3 w-24 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasCriticalAlerts = summary.critical_alerts > 0;
  const hasOfflineDevices = summary.offline_devices > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* Card 1: Monitored Tanks */}
      <div className="hydrava-card p-5 border border-blue-900/30 bg-gradient-to-br from-[#111e38] to-[#0c162a] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/50 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monitored Tanks
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {summary.total_tanks}
          </div>
          <p className="text-xs text-blue-300/60 mt-1 font-medium">Active locations</p>
        </div>
      </div>

      {/* Card 2: Critical Alerts */}
      <div
        className={cn(
          'hydrava-card p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group',
          hasCriticalAlerts
            ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/30 to-[#111e38] glow-red'
            : 'border-blue-900/30 bg-gradient-to-br from-[#111e38] to-[#0c162a]'
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              hasCriticalAlerts ? 'text-rose-400' : 'text-slate-400'
            )}
          >
            Critical Alerts
          </span>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105',
              hasCriticalAlerts
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400'
                : 'bg-slate-800/80 border border-slate-700/50 text-slate-400'
            )}
          >
            <AlertOctagon
              className={cn('w-5 h-5', hasCriticalAlerts && 'animate-pulse text-rose-400')}
            />
          </div>
        </div>
        <div>
          <div
            className={cn(
              'text-3xl font-extrabold font-mono tracking-tight',
              hasCriticalAlerts ? 'text-rose-400' : 'text-white'
            )}
          >
            {summary.critical_alerts}
          </div>
          <p
            className={cn(
              'text-xs mt-1 font-medium',
              hasCriticalAlerts ? 'text-rose-300/80' : 'text-slate-400'
            )}
          >
            Require immediate action
          </p>
        </div>
      </div>

      {/* Card 3: Healthy Tanks */}
      <div className="hydrava-card p-5 border border-blue-900/30 bg-gradient-to-br from-[#111e38] to-[#0c162a] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/50 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Healthy Tanks
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
            {summary.healthy_tanks}
          </div>
          <p className="text-xs text-emerald-400/60 mt-1 font-medium">Operating normally</p>
        </div>
      </div>

      {/* Card 4: Offline Devices */}
      <div
        className={cn(
          'hydrava-card p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group',
          hasOfflineDevices
            ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-[#111e38] glow-amber'
            : 'border-blue-900/30 bg-gradient-to-br from-[#111e38] to-[#0c162a]'
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              hasOfflineDevices ? 'text-amber-400' : 'text-slate-400'
            )}
          >
            Offline Devices
          </span>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105',
              hasOfflineDevices
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                : 'bg-slate-800/80 border border-slate-700/50 text-slate-400'
            )}
          >
            <WifiOff className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div
            className={cn(
              'text-3xl font-extrabold font-mono tracking-tight',
              hasOfflineDevices ? 'text-amber-400' : 'text-white'
            )}
          >
            {summary.offline_devices}
          </div>
          <p
            className={cn(
              'text-xs mt-1 font-medium',
              hasOfflineDevices ? 'text-amber-300/80' : 'text-slate-400'
            )}
          >
            No recent signal
          </p>
        </div>
      </div>
    </div>
  );
}
