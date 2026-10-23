import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { WaterStatus } from '@/types/water-monitoring';
import { cn, getStatusLabel } from '@/lib/utils';

export interface StatusBadgeProps {
  status: WaterStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const getStatusStyles = () => {
    switch (status) {
      case 'normal':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'low':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-500/20 animate-pulse';
      case 'overflow_risk':
        return 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20';
      case 'unknown':
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (status) {
      case 'normal':
        return <CheckCircle2 className={iconSizes} />;
      case 'low':
        return <AlertTriangle className={iconSizes} />;
      case 'critical':
        return <AlertOctagon className={cn(iconSizes, 'animate-bounce')} />;
      case 'overflow_risk':
        return <TrendingUp className={iconSizes} />;
      case 'unknown':
      default:
        return <HelpCircle className={iconSizes} />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full tracking-wide select-none transition-all duration-200',
        sizeClasses,
        getStatusStyles(),
        className
      )}
    >
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
}
