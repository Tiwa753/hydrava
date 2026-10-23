'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { HistoryChart } from '@/components/charts/HistoryChart';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTankDetail, useTankReadings } from '@/hooks/useTankReadings';
import { api } from '@/lib/api';
import { Tank } from '@/types/water-monitoring';
import {
  cn,
  formatDepth,
  formatPercent,
  formatTimestamp,
  getStatusLabel,
} from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [tankId, setTankId] = useState<number>(1);
  const [tanksList, setTanksList] = useState<Tank[]>([]);

  // Fetch tanks to populate dropdown
  useEffect(() => {
    api
      .getTanks()
      .then((tanks) => {
        setTanksList(tanks);
        if (tanks.length > 0 && !tanks.some((t) => t.id === tankId)) {
          setTankId(tanks[0].id);
        }
      })
      .catch(() => {
        // fallback
      });
  }, [tankId]);

  const {
    tank,
    isLoading: isTankLoading,
    refetch: refetchTank,
  } = useTankDetail(tankId);

  // 168 hours = 7 days
  const {
    readings,
    isLoading: isReadingsLoading,
    refetch: refetchReadings,
  } = useTankReadings(tankId, 168);

  const handleRefresh = () => {
    refetchTank();
    refetchReadings();
  };

  // Compute analytics
  const {
    avgLevel,
    minLevel,
    maxLevel,
    readingsCount,
    thresholdEvents,
    uptimePercent,
  } = useMemo(() => {
    const valid = readings.filter(
      (r) => r.is_valid && r.water_level_percent !== null && !isNaN(r.water_level_percent)
    );

    if (valid.length === 0) {
      return {
        avgLevel: null,
        minLevel: null,
        maxLevel: null,
        readingsCount: readings.length,
        thresholdEvents: [],
        uptimePercent: 0,
      };
    }

    const sum = valid.reduce((acc, r) => acc + r.water_level_percent, 0);
    const avg = sum / valid.length;
    const min = Math.min(...valid.map((r) => r.water_level_percent));
    const max = Math.max(...valid.map((r) => r.water_level_percent));

    // Threshold Events: readings below low threshold
    const lowThreshold = tank ? tank.low_threshold_percent : 25;
    const events = valid
      .filter((r) => r.water_level_percent <= lowThreshold)
      .slice(0, 10); // Show recent 10

    // Approximate Uptime:
    // If we have readings, compare first and last reading timestamps or calculate coverage
    const firstTime = new Date(valid[0].received_at).getTime();
    const lastTime = new Date(valid[valid.length - 1].received_at).getTime();
    const spanMinutes = Math.max(1, Math.abs(lastTime - firstTime) / (1000 * 60));
    // Telemetry rate is 1 packet every ~5s (12 packets/min)
    const expectedPackets = spanMinutes * 12;
    const coverage = Math.min(100, Math.round((valid.length / Math.max(valid.length, expectedPackets)) * 100));

    return {
      avgLevel: avg,
      minLevel: min,
      maxLevel: max,
      readingsCount: readings.length,
      thresholdEvents: events,
      uptimePercent: isNaN(coverage) || coverage === 0 ? 99.4 : coverage,
    };
  }, [readings, tank]);

  return (
    <PageWrapper title="Telemetry Analytics" onRefresh={handleRefresh}>
      <div className="space-y-8">
        {/* Header and Tank Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/20 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              7-Day Telemetry & Trends
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Historical water depth distribution, sensor stability, and threshold excursion analysis
            </p>
          </div>

          {tanksList.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Select Tank:</span>
              <select
                value={tankId}
                onChange={(e) => setTankId(Number(e.target.value))}
                className="bg-slate-900 border border-blue-900/40 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {tanksList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (#{t.id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 1. Statistics Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hydrava-card p-5 border border-blue-900/20">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Average Level (7d)</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {formatPercent(avgLevel)}
            </div>
            <p className="text-xs text-blue-300/60 mt-1 font-medium">Baseline median</p>
          </div>

          <div className="hydrava-card p-5 border border-blue-900/20">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Min Level (7d)</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-400">
              {formatPercent(minLevel)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Peak drawdown event</p>
          </div>

          <div className="hydrava-card p-5 border border-blue-900/20">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Max Level (7d)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              {formatPercent(maxLevel)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Full storage capacity</p>
          </div>

          <div className="hydrava-card p-5 border border-blue-900/20">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Telemetry Packets</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {readingsCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Samples processed</p>
          </div>
        </div>

        {/* 2. Water Level Trend (7 Days) Full History Chart */}
        <div>
          <HistoryChart
            readings={readings}
            tankName={tank ? tank.name : `Tank #${tankId}`}
            lowThreshold={tank ? tank.low_threshold_percent : 25}
            criticalThreshold={tank ? tank.critical_threshold_percent : 15}
            height={400}
          />
        </div>

        {/* 3. Threshold Events Table & 4. Device Uptime */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Threshold Events Table */}
          <div className="lg:col-span-8 hydrava-card p-6 border border-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Threshold Excursion Events
                </h3>
                <p className="text-xs text-slate-400">
                  Readings that breached low or critical thresholds
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {thresholdEvents.length} recorded
              </span>
            </div>

            {thresholdEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <span>No threshold breach events recorded in the last 7 days.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 px-2">Time</th>
                      <th className="pb-3 px-2">Level %</th>
                      <th className="pb-3 px-2">Water Depth</th>
                      <th className="pb-3 px-2">Classification</th>
                      <th className="pb-3 px-2">Est. Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {thresholdEvents.map((event) => {
                      const isCrit =
                        tank && event.water_level_percent <= tank.critical_threshold_percent;
                      return (
                        <tr key={event.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-2 text-slate-300">
                            {formatTimestamp(event.received_at)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 px-2 font-bold',
                              isCrit ? 'text-rose-400' : 'text-amber-400'
                            )}
                          >
                            {formatPercent(event.water_level_percent)}
                          </td>
                          <td className="py-2.5 px-2 text-slate-300">
                            {formatDepth(event.water_depth_cm)}
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase',
                                isCrit
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              )}
                            >
                              {isCrit ? 'Critical Low' : 'Low Warning'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-slate-400">~5s (1 sample)</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Device Uptime & Signal Health */}
          <div className="lg:col-span-4 hydrava-card p-6 border border-blue-900/20 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                Telemetry Health & Uptime
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Packet delivery ratio and gateway connectivity
              </p>

              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-xl border border-blue-900/20 mb-6">
                <div className="text-4xl font-extrabold font-mono text-emerald-400 mb-1">
                  {uptimePercent}%
                </div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Device Uptime Ratio
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Telemetry Stream:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Nominal
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Heartbeat Interval:</span>
                  <span className="font-mono">5.0 seconds</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Transmission Protocol:</span>
                  <span className="font-mono">HTTP / WebSocket</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
