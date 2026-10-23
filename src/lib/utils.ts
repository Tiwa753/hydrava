import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { WaterStatus } from '@/types/water-monitoring';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(1)}%`;
}

export function formatDepth(cm: number | null | undefined): string {
  if (cm === null || cm === undefined || isNaN(cm)) {
    return '--';
  }
  return `${cm.toFixed(1)} cm`;
}

export function formatDistance(cm: number | null | undefined): string {
  if (cm === null || cm === undefined || isNaN(cm)) {
    return '--';
  }
  return `${cm.toFixed(1)} cm`;
}

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  try {
    const date = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    if (!isValid(date)) return 'Never';
    return format(date, 'MMM d, yyyy, HH:mm');
  } catch {
    return 'Never';
  }
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  try {
    const date = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    if (!isValid(date)) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Never';
  }
}

export function getStatusColor(status: WaterStatus): string {
  switch (status) {
    case 'normal':
      return 'text-green-400';
    case 'low':
      return 'text-amber-400';
    case 'critical':
      return 'text-red-400';
    case 'overflow_risk':
      return 'text-purple-400';
    case 'unknown':
    default:
      return 'text-gray-400';
  }
}

export function getStatusBgColor(status: WaterStatus): string {
  switch (status) {
    case 'normal':
      return 'bg-green-500/10 text-green-400 border border-green-500/30';
    case 'low':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'critical':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    case 'overflow_risk':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
    case 'unknown':
    default:
      return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
  }
}

export function getStatusLabel(status: WaterStatus): string {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Low Water';
    case 'critical':
      return 'Critical';
    case 'overflow_risk':
      return 'Overflow Risk';
    case 'unknown':
    default:
      return 'Unknown';
  }
}

export function getSeverityColor(severity: 'warning' | 'critical'): string {
  return severity === 'critical' ? 'text-red-400' : 'text-amber-400';
}

export function getAlertTypeLabel(type: string): string {
  switch (type) {
    case 'low_water':
      return 'Low Water';
    case 'critical_water':
      return 'Critical Water Level';
    case 'overflow_risk':
      return 'Overflow Risk';
    case 'device_offline':
      return 'Device Offline';
    default:
      return type
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
}

export function isStale(isoTimestamp: string | null | undefined, thresholdSeconds: number = 30): boolean {
  if (!isoTimestamp) return true;
  try {
    const date = typeof isoTimestamp === 'string' ? parseISO(isoTimestamp) : new Date(isoTimestamp);
    if (!isValid(date)) return true;
    return Date.now() - date.getTime() > thresholdSeconds * 1000;
  } catch {
    return true;
  }
}
