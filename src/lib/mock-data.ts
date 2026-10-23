import type {
  DashboardResponse,
  Tank,
  Reading,
  Alert,
  Device,
} from '@/types/water-monitoring';

const now = new Date();
const ago = (minutes: number) =>
  new Date(now.getTime() - minutes * 60 * 1000).toISOString();

// ── Readings: 24h of history, one every 10 minutes ──────────────────────────
export const MOCK_READINGS: Reading[] = Array.from({ length: 144 }, (_, i) => {
  const minutesAgo = (143 - i) * 10;
  // Realistic wave: starts 72%, dips to 18% around tick 80, refills to 91%, comes down to 65%
  const t = i / 143;
  let level: number;
  if (i < 80) {
    level = 72 - i * 0.68; // drain from 72 → ~18
  } else if (i < 90) {
    level = 18 + (i - 80) * 7.3; // refill spike → ~91
  } else {
    level = 91 - (i - 90) * 0.49; // slow drain → ~65
  }
  level = Math.max(0, Math.min(100, level + (Math.random() - 0.5) * 3));
  const H = 120;
  const distance_cm = H * (1 - level / 100);
  return {
    id: i + 1,
    device_id: 'hydrava-node-001',
    tank_id: 1,
    distance_cm: parseFloat(distance_cm.toFixed(2)),
    water_depth_cm: parseFloat((H - distance_cm).toFixed(2)),
    water_level_percent: parseFloat(level.toFixed(2)),
    wifi_rssi: -55 + Math.floor(Math.random() * 20 - 10),
    is_valid: true,
    received_at: ago(minutesAgo),
  };
});

const latestReading = MOCK_READINGS[MOCK_READINGS.length - 1];

// ── Tank ────────────────────────────────────────────────────────────────────
export const MOCK_TANK: Tank = {
  id: 1,
  name: 'Male Hostel Water Tank',
  location: 'Male Hostel Block A',
  reference_height_cm: 120,
  low_threshold_percent: 30,
  critical_threshold_percent: 15,
  created_at: ago(10080), // 7 days ago
  current_status: 'normal',
  device_status: 'online',
  latest_reading: latestReading,
};

// ── Alerts ──────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    tank_id: 1,
    alert_type: 'low_water',
    severity: 'warning',
    message: 'Water level low at 24.3%',
    is_acknowledged: true,
    is_resolved: true,
    created_at: ago(4320), // 3 days ago
    acknowledged_at: ago(4310),
    resolved_at: ago(4080),
    last_reading_percent: 24.3,
  },
  {
    id: 2,
    tank_id: 1,
    alert_type: 'critical_water',
    severity: 'critical',
    message: 'Water level critically low at 11.2%',
    is_acknowledged: true,
    is_resolved: true,
    created_at: ago(7200), // 5 days ago
    acknowledged_at: ago(7190),
    resolved_at: ago(6840),
    last_reading_percent: 11.2,
  },
];

// ── Device ──────────────────────────────────────────────────────────────────
export const MOCK_DEVICE: Device = {
  id: 1,
  device_id: 'hydrava-node-001',
  tank_id: 1,
  status: 'online',
  last_seen_at: ago(0.1),
  created_at: ago(10080),
  is_online: true,
};

// ── Dashboard ───────────────────────────────────────────────────────────────
export const MOCK_DASHBOARD: DashboardResponse = {
  summary: {
    total_tanks: 1,
    critical_alerts: 0,
    healthy_tanks: 1,
    offline_devices: 0,
    last_updated: new Date().toISOString(),
  },
  tanks: [
    {
      tank_id: 1,
      name: 'Male Hostel Water Tank',
      location: 'Male Hostel Block A',
      water_level_percent: latestReading.water_level_percent,
      status: 'normal',
      device_status: 'online',
      last_reading_at: latestReading.received_at,
    },
  ],
};
