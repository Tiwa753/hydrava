'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Radio,
  Layers,
  Gauge,
  Ruler,
  AlertTriangle,
  AlertOctagon,
  Waves,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { WaterLevelGauge } from '@/components/ui/WaterLevelGauge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HistoryChart } from '@/components/charts/HistoryChart';
import { AlertList } from '@/components/alerts/AlertList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTankDetail, useTankReadings, useAlerts } from '@/hooks/useTankReadings';
import {
  cn,
  formatDepth,
  formatDistance,
  formatPercent,
  formatRelativeTime,
  formatTimestamp,
} from '@/lib/utils';
import { api } from '@/lib/api';

const periodOptions = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

export default function TankDetailPage() {
  const params = useParams();
  const tankId = Number(params.tankId);
  const [selectedHours, setSelectedHours] = useState<number>(24);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    tank,
    isLoading: isTankLoading,
    error: tankError,
    refetch: refetchTank,
  } = useTankDetail(tankId);

  const {
    readings,
    isLoading: isReadingsLoading,
    error: readingsError,
    refetch: refetchReadings,
  } = useTankReadings(tankId, selectedHours);

  const {
    alerts,
    isLoading: isAlertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useAlerts(false);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id, { is_acknowledged: true });
      setActionError(null);
      refetchAlerts();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to acknowledge alert.');
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.acknowledgeAlert(id, { is_resolved: true });
      setActionError(null);
      refetchAlerts();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to resolve alert.');
    }
  };

  const handleRefresh = () => {
    refetchTank();
    refetchReadings();
    refetchAlerts();
  };

  if (isTankLoading && !tank) {
    return (
      <PageWrapper title="Tank Details">
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingSpinner size="lg" label="Loading vessel telemetry..." />
        </div>
      </PageWrapper>
    );
  }

  if (tankError || !tank) {
    return (
      <PageWrapper title={tankError ? 'Unable to Load Tank' : 'Tank Not Found'}>
        <div className="hydrava-card p-12 text-center max-w-lg mx-auto my-12 border border-rose-500/20">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {tankError ? 'Could Not Load Storage Tank' : 'Storage Tank Not Found'}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {tankError || `The requested tank ID (#${tankId}) could not be retrieved from the telemetry registry.`}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const latestReading = tank.latest_reading;
  const tankAlerts = alerts.filter((a) => a.tank_id === tankId);

  return (
    <PageWrapper
      title={tank.name}
      onRefresh={handleRefresh}
      lastUpdated={latestReading ? new Date(latestReading.received_at) : null}
      isConnected={tank.device_status === 'online'}
    >
      <div className="space-y-6">
        {(readingsError || alertsError || actionError) && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {actionError || readingsError || alertsError}
          </div>
        )}

        {/* Navigation & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/20 pb-5">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Back to Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {tank.name}
                </h2>
                <StatusBadge status={tank.current_status} size="md" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{tank.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      tank.device_status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
                    )}
                  />
                  <span className="capitalize">{tank.device_status} Device</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Last reading:{' '}
                    {latestReading
                      ? formatRelativeTime(latestReading.received_at)
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-blue-900/30 self-start md:self-auto">
            {periodOptions.map((period) => (
              <button
                key={period.hours}
                onClick={() => setSelectedHours(period.hours)}
                type="button"
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  selectedHours === period.hours
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Telemetry Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Gauge & Detailed Metric Grid */}
          <div className="lg:col-span-5 space-y-6">
            {/* Water Gauge Card */}
            <div className="hydrava-card p-6 flex flex-col items-center justify-center border border-blue-900/20 text-center">
              <div className="py-2">
                <WaterLevelGauge
                  percent={latestReading?.water_level_percent ?? null}
                  status={tank.current_status}
                  size="lg"
                  showLabel={true}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-xs text-slate-400">Current Health:</span>
                <StatusBadge status={tank.current_status} size="sm" />
              </div>
            </div>

            {/* 6-Item Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="hydrava-card p-3.5 border border-blue-900/20">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Waves className="w-3.5 h-3.5 text-blue-400" />
                  <span>Water Level</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {formatPercent(latestReading?.water_level_percent)}
                </div>
              </div>

              <div className="hydrava-card p-3.5 border border-blue-900/20">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Water Depth</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {formatDepth(latestReading?.water_depth_cm)}
                </div>
              </div>

              <div className="hydrava-card p-3.5 border border-blue-900/20">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sensor Distance</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {formatDistance(latestReading?.distance_cm)}
                </div>
              </div>

              <div className="hydrava-card p-3.5 border border-blue-900/20">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reference Height</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {formatDepth(tank.reference_height_cm)}
                </div>
              </div>

              <div className="hydrava-card p-3.5 border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Low Threshold</span>
                </div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {formatPercent(tank.low_threshold_percent)}
                </div>
              </div>

              <div className="hydrava-card p-3.5 border border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center gap-2 text-xs text-rose-300 mb-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Critical Threshold</span>
                </div>
                <div className="text-xl font-bold font-mono text-rose-400">
                  {formatPercent(tank.critical_threshold_percent)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Historical Line Chart */}
          <div className="lg:col-span-7 flex flex-col">
            <HistoryChart
              readings={readings}
              tankName={tank.name}
              lowThreshold={tank.low_threshold_percent}
              criticalThreshold={tank.critical_threshold_percent}
              height={420}
            />
          </div>
        </div>

        {/* Active Tank Alerts Section */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-300">
              Active Alerts for {tank.name}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {tankAlerts.length} unresolved
            </span>
          </div>

          <AlertList
            alerts={tankAlerts}
            isLoading={isAlertsLoading}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            showResolved={false}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
