import Link from 'next/link';
import { ArrowUpRight, Radio, MapPin, Clock } from 'lucide-react';
import { TankStatusItem } from '@/types/water-monitoring';
import { WaterLevelGauge } from '@/components/ui/WaterLevelGauge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn, formatRelativeTime } from '@/lib/utils';

export interface TankStatusGridProps {
  tanks?: TankStatusItem[];
  isLoading?: boolean;
}

export function TankStatusGrid({ tanks = [], isLoading = false }: TankStatusGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="hydrava-card p-6 border border-blue-900/20 animate-pulse space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-slate-800 rounded" />
                <div className="h-3 w-24 bg-slate-800/60 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded-full" />
            </div>
            <div className="py-4 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-slate-800" />
            </div>
            <div className="h-4 w-full bg-slate-800/40 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tanks.length === 0) {
    return (
      <div className="hydrava-card p-12 text-center border border-blue-900/20">
        <p className="text-slate-400 font-medium">No storage tanks currently registered.</p>
        <p className="text-xs text-slate-500 mt-1">
          Add tanks in configuration or start simulator.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tanks.map((tank) => {
        const isCritical = tank.status === 'critical';
        const isLow = tank.status === 'low';
        const isOverflow = tank.status === 'overflow_risk';

        return (
          <div
            key={tank.tank_id}
            className={cn(
              'hydrava-card p-6 border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1',
              isCritical
                ? 'border-rose-500/50 hover:border-rose-400 glow-red animate-pulse-slow'
                : isLow
                ? 'border-amber-500/40 hover:border-amber-400 glow-amber'
                : isOverflow
                ? 'border-purple-500/40 hover:border-purple-400'
                : 'border-blue-900/20 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/40'
            )}
          >
            {/* Top row: Name, Location, Status Badge */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    {tank.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{tank.location}</span>
                  </div>
                </div>
                <StatusBadge status={tank.status} size="sm" />
              </div>

              {/* Middle section: Gauge & Device Status */}
              <div className="py-4 my-2 flex items-center justify-around bg-slate-950/40 rounded-xl border border-blue-900/20">
                <WaterLevelGauge
                  percent={tank.water_level_percent}
                  status={tank.status}
                  size="sm"
                  showLabel={false}
                />

                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        tank.device_status === 'online'
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : 'bg-slate-600'
                      )}
                    />
                    <span className="text-xs font-medium text-slate-300 capitalize">
                      {tank.device_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatRelativeTime(tank.last_reading_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action link */}
            <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">ID: #{tank.tank_id}</span>
              <Link
                href={`/tanks/${tank.tank_id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group-hover:translate-x-0.5"
              >
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
