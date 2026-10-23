'use client';

import { useState } from 'react';
import { RefreshCw, Activity, Radio, WifiOff } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

export interface HeaderProps {
  title: string;
  isConnected?: boolean;
  isPolling?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

export function Header({
  title,
  isConnected = false,
  isPolling = false,
  lastUpdated = null,
  onRefresh,
}: HeaderProps) {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRotating(true);
      onRefresh();
      setTimeout(() => setIsRotating(false), 800);
    }
  };

  return (
    <header className="h-16 w-full sticky top-0 z-20 backdrop-blur-md bg-[#0a0f1e]/85 border-b border-blue-900/20 px-4 sm:px-6 flex items-center justify-between">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
      </div>

      {/* Center Subtitle on Mobile */}
      <div className="hidden sm:block lg:hidden text-xs font-semibold text-blue-400 uppercase tracking-widest">
        Hydrava Monitor
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Connectivity Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-blue-900/30 text-xs">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-medium hidden md:inline">Live WS</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400 md:hidden" />
            </>
          ) : isPolling ? (
            <>
              <span className="inline-flex rounded-full h-2 w-2 bg-blue-500" />
              <span className="text-blue-400 font-medium hidden md:inline">Polling HTTP</span>
              <Activity className="w-3.5 h-3.5 text-blue-400 md:hidden" />
            </>
          ) : (
            <>
              <span className="inline-flex rounded-full h-2 w-2 bg-rose-500" />
              <span className="text-rose-400 font-medium hidden md:inline">Offline</span>
              <WifiOff className="w-3.5 h-3.5 text-rose-400 md:hidden" />
            </>
          )}
        </div>

        {/* Last updated timestamp */}
        <div className="text-xs text-slate-400 hidden sm:block">
          {lastUpdated ? (
            <span>
              Updated <span className="text-slate-200">{formatRelativeTime(lastUpdated.toISOString())}</span>
            </span>
          ) : (
            <span>Connecting...</span>
          )}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={handleRefreshClick}
            type="button"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-blue-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={cn(
                'w-4 h-4 transition-transform duration-700',
                isRotating && 'rotate-180 text-blue-400'
              )}
            />
          </button>
        )}
      </div>
    </header>
  );
}
