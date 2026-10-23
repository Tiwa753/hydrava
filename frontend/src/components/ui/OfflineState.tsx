import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export interface OfflineStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  lastKnownAt?: string | null;
  className?: string;
}

export function OfflineState({
  title = 'Connection Lost',
  message = 'Unable to reach the Hydrava monitoring server. Please check your network or server status.',
  onRetry,
  lastKnownAt,
  className,
}: OfflineStateProps) {
  return (
    <div
      className={`hydrava-card p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto my-8 border border-rose-500/20 shadow-xl ${
        className || ''
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
        <WifiOff className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{message}</p>

      {lastKnownAt && (
        <div className="w-full mb-5 py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2 text-xs text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Last data received {formatRelativeTime(lastKnownAt)}</span>
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/30 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
