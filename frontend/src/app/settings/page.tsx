'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTankDetail } from '@/hooks/useTankReadings';
import { api } from '@/lib/api';
import {
  Settings,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Server,
  Cpu,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [selectedTankId, setSelectedTankId] = useState<number>(1);
  const { tank, isLoading, error: tankError, refetch } = useTankDetail(selectedTankId);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [refHeight, setRefHeight] = useState<number>(120);
  const [lowThreshold, setLowThreshold] = useState<number>(25);
  const [critThreshold, setCritThreshold] = useState<number>(15);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Health and System state
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [backendVersion, setBackendVersion] = useState<string>('v1.0.0');

  // Populate form when tank data loads
  useEffect(() => {
    if (tank) {
      setName(tank.name);
      setLocation(tank.location);
      setRefHeight(tank.reference_height_cm);
      setLowThreshold(tank.low_threshold_percent);
      setCritThreshold(tank.critical_threshold_percent);
    }
  }, [tank]);

  // Query backend health
  useEffect(() => {
    api
      .getHealth()
      .then((res) => {
        setHealthStatus('healthy');
        if (res.version) setBackendVersion(res.version);
      })
      .catch(() => {
        setHealthStatus('offline');
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveSuccess(false);

    // Validations:
    // 1. Reference height must be > 0
    if (refHeight <= 0 || isNaN(refHeight)) {
      setFormError('Reference height must be greater than 0 cm.');
      return;
    }

    // 2. Thresholds must be between 0 and 100
    if (lowThreshold < 0 || lowThreshold > 100 || isNaN(lowThreshold)) {
      setFormError('Low threshold must be between 0% and 100%.');
      return;
    }

    if (critThreshold < 0 || critThreshold > 100 || isNaN(critThreshold)) {
      setFormError('Critical threshold must be between 0% and 100%.');
      return;
    }

    // 3. Critical threshold must be < Low threshold
    if (critThreshold >= lowThreshold) {
      setFormError('Critical water threshold must be strictly less than Low water threshold.');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateTankSettings(selectedTankId, {
        name,
        location,
        reference_height_cm: Number(refHeight),
        low_threshold_percent: Number(lowThreshold),
        critical_threshold_percent: Number(critThreshold),
      });
      setSaveSuccess(true);
      refetch();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update tank configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper title="System Settings" onRefresh={refetch}>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="border-b border-blue-900/20 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure vessel geometry, notification thresholds, device telemetry, and system connectivity
          </p>
        </div>

        {/* Informational banner */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3 text-blue-300 text-xs">
          <Info className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-blue-200">Notice:</span> Threshold modifications take effect
            immediately on the next incoming sensor telemetry packet. Existing alerts will be evaluated against
            the revised limits.
          </p>
        </div>

        {/* Loading state for tank data */}
        {isLoading && !tank ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" label="Loading vessel configuration..." />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Vessel Configuration Card */}
            <div className="hydrava-card p-6 border border-blue-900/20 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Storage Vessel Calibration (Tank #{selectedTankId})
                </h3>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 flex items-center gap-2 text-rose-300 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-xs font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Tank configuration saved and applied successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tank Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                    placeholder="e.g. Main Header Tank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Location Description
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                    placeholder="e.g. Building A - Roof"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Reference Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={refHeight}
                    onChange={(e) => setRefHeight(parseFloat(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Sensor to bottom depth</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                    Low Water Threshold (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={lowThreshold}
                    onChange={(e) => setLowThreshold(parseFloat(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm text-amber-300 font-mono focus:outline-none transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Warning alert trigger</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
                    Critical Threshold (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={critThreshold}
                    onChange={(e) => setCritThreshold(parseFloat(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-rose-500/40 focus:border-rose-400 rounded-lg px-3.5 py-2 text-sm text-rose-300 font-mono focus:outline-none transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Emergency alert trigger</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide uppercase transition-all duration-200 shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Device Configuration (Read-only section) */}
        <div className="hydrava-card p-6 border border-blue-900/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Device Telemetry Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Assigned Device ID</span>
              <span className="font-mono text-white text-sm font-semibold">ESP32-TANK-01</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Telemetry Heartbeat Interval</span>
              <span className="font-mono text-emerald-400 text-sm font-semibold">
                5 seconds (Simulator)
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Offline Inactivity Timeout</span>
              <span className="font-mono text-amber-400 text-sm font-semibold">30 seconds</span>
            </div>
          </div>
        </div>

        {/* System & API Status Section */}
        <div className="hydrava-card p-6 border border-blue-900/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">System Architecture & Backend Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Backend API Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    healthStatus === 'healthy'
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                      : 'bg-rose-500'
                  )}
                />
                <span className="font-semibold text-white capitalize">
                  {healthStatus === 'healthy' ? 'Operational' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">API Base URL</span>
              <span className="font-mono text-slate-300 text-xs">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Backend Core Engine</span>
              <span className="font-mono text-blue-400 text-sm font-semibold">
                Hydrava Engine {backendVersion}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
