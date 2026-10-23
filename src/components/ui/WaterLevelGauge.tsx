'use client';

import { WaterStatus } from '@/types/water-monitoring';
import { cn, formatPercent } from '@/lib/utils';

export interface WaterLevelGaugeProps {
  percent: number | null;
  status: WaterStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function WaterLevelGauge({
  percent,
  status,
  size = 'md',
  showLabel = true,
  animated = true,
  className,
}: WaterLevelGaugeProps) {
  // Dimensions map
  const dimensions = {
    sm: { size: 80, stroke: 7, text: 'text-sm font-bold', labelText: 'text-[9px]' },
    md: { size: 160, stroke: 12, text: 'text-2xl font-extrabold', labelText: 'text-xs' },
    lg: { size: 220, stroke: 16, text: 'text-4xl font-extrabold', labelText: 'text-sm' },
  }[size];

  const dim = dimensions.size;
  const strokeWidth = dimensions.stroke;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Safe percentage value
  const validPercent =
    percent === null || percent === undefined || isNaN(percent)
      ? 0
      : Math.min(100, Math.max(0, percent));

  const strokeDashoffset = circumference - (validPercent / 100) * circumference;

  // Status color codes for SVG
  const getStatusHex = () => {
    switch (status) {
      case 'normal':
        return '#22c55e'; // green-500
      case 'low':
        return '#f59e0b'; // amber-500
      case 'critical':
        return '#ef4444'; // red-500
      case 'overflow_risk':
        return '#a855f7'; // purple-500
      case 'unknown':
      default:
        return '#64748b'; // slate-500
    }
  };

  const statusColorHex = getStatusHex();
  const isAvailable = percent !== null && percent !== undefined && !isNaN(percent);

  // Inner wave water fill height
  const innerRadius = radius - strokeWidth / 2 - 2;
  const waterHeightY = dim / 2 + innerRadius - (innerRadius * 2 * validPercent) / 100;
  const clipId = `gauge-circle-clip-${size}-${dim}`;

  return (
    <div
      className={cn('relative inline-flex flex-col items-center justify-center select-none', className)}
      style={{ width: dim, height: dim }}
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        className="rotate-[-90deg] overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={dim / 2} cy={dim / 2} r={innerRadius} />
          </clipPath>
          <linearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={statusColorHex} stopOpacity="0.8" />
            <stop offset="100%" stopColor={statusColorHex} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Inner water wave simulation for md & lg */}
        {size !== 'sm' && isAvailable && (
          <g clipPath={`url(#${clipId})`}>
            {/* Background fluid base */}
            <rect
              x="0"
              y="0"
              width={dim}
              height={dim}
              className="fill-blue-950/20"
            />
            {/* Wave shape */}
            <path
              d={`M 0,${waterHeightY} Q ${dim / 4},${waterHeightY - 6} ${dim / 2},${waterHeightY} T ${dim},${waterHeightY} L ${dim},${dim} L 0,${dim} Z`}
              fill={statusColorHex}
              fillOpacity="0.12"
              className={cn(animated && 'wave-animate')}
            />
            <path
              d={`M 0,${waterHeightY + 4} Q ${dim / 4},${waterHeightY + 8} ${dim / 2},${waterHeightY + 4} T ${dim},${waterHeightY + 4} L ${dim},${dim} L 0,${dim} Z`}
              fill={statusColorHex}
              fillOpacity="0.08"
            />
          </g>
        )}

        {/* Outer background track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeOpacity="0.6"
        />

        {/* Gauge progress stroke */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={isAvailable ? `url(#grad-${size})` : '#475569'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isAvailable ? strokeDashoffset : circumference}
          strokeLinecap="round"
          style={{
            transition: animated ? 'stroke-dashoffset 1s ease-in-out' : 'none',
          }}
        />
      </svg>

      {/* Center Label & Metric */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={cn(
            dimensions.text,
            'tracking-tight font-mono leading-none',
            isAvailable ? 'text-white' : 'text-slate-500'
          )}
        >
          {isAvailable ? formatPercent(percent) : '--'}
        </span>
        {showLabel && size !== 'sm' && (
          <span
            className={cn(
              dimensions.labelText,
              'text-slate-400 font-medium tracking-wide mt-1 uppercase'
            )}
          >
            Water Level
          </span>
        )}
      </div>
    </div>
  );
}
