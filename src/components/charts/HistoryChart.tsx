'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { Reading } from '@/types/water-monitoring';
import { formatPercent, formatDepth } from '@/lib/utils';

export interface HistoryChartProps {
  readings: Reading[];
  tankName: string;
  lowThreshold: number;
  criticalThreshold: number;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      timestamp: string;
      water_level_percent: number;
      water_depth_cm: number;
      distance_cm: number;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = parseISO(data.timestamp);
    const timeFormatted = isValid(date)
      ? format(date, 'MMM d, yyyy HH:mm:ss')
      : data.timestamp;

    return (
      <div className="bg-[#0d1528] border border-blue-900/40 p-3 rounded-lg shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
          {timeFormatted}
        </p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-blue-400 font-medium">Water Level:</span>
          <span className="font-mono font-bold text-white">
            {formatPercent(data.water_level_percent)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Water Depth:</span>
          <span className="font-mono text-slate-200">
            {formatDepth(data.water_depth_cm)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Sensor Distance:</span>
          <span className="font-mono text-slate-200">
            {formatDepth(data.distance_cm)}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function HistoryChart({
  readings,
  tankName,
  lowThreshold,
  criticalThreshold,
  height = 360,
}: HistoryChartProps) {
  const chartData = useMemo(() => {
    // Sort chronological: oldest first for chart
    const sorted = [...readings].sort(
      (a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
    );

    return sorted.map((r) => ({
      timestamp: r.received_at,
      water_level_percent: r.is_valid ? r.water_level_percent : null,
      water_depth_cm: r.water_depth_cm,
      distance_cm: r.distance_cm,
    }));
  }, [readings]);

  const spansMultipleDays = useMemo(() => {
    if (chartData.length < 2) return false;
    const first = new Date(chartData[0].timestamp).getTime();
    const last = new Date(chartData[chartData.length - 1].timestamp).getTime();
    return Math.abs(last - first) > 24 * 3600 * 1000;
  }, [chartData]);

  const formatXAxis = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      if (!isValid(date)) return '';
      return spansMultipleDays ? format(date, 'MM/dd HH:mm') : format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  if (!readings || readings.length === 0) {
    return (
      <div
        className="hydrava-card p-6 flex flex-col items-center justify-center border border-blue-900/20 text-center"
        style={{ height }}
      >
        <p className="text-slate-400 font-medium">No historical telemetry recorded for {tankName}.</p>
        <p className="text-xs text-slate-500 mt-1">Waiting for incoming telemetry packets...</p>
      </div>
    );
  }

  return (
    <div className="hydrava-card p-4 sm:p-6 border border-blue-900/20 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Water Level History
          </h4>
          <p className="text-xs text-slate-500">Live sensor telemetry and alert thresholds</p>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              minTickGap={40}
            />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-400 font-medium">{value}</span>}
            />

            {/* Threshold reference lines */}
            <ReferenceLine
              y={lowThreshold}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Low (${lowThreshold}%)`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <ReferenceLine
              y={criticalThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Critical (${criticalThreshold}%)`,
                fill: '#ef4444',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />

            {/* Telemetry line */}
            <Line
              type="monotone"
              dataKey="water_level_percent"
              name="Water Level"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#60a5fa', stroke: '#1d4ed8', strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
