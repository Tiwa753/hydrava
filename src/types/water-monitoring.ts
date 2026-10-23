export type WaterStatus = 'normal' | 'low' | 'critical' | 'overflow_risk' | 'unknown';
export type DeviceStatus = 'online' | 'offline' | 'unknown';

export interface Tank {
  id: number;
  name: string;
  location: string;
  reference_height_cm: number;
  low_threshold_percent: number;
  critical_threshold_percent: number;
  created_at: string;
  current_status: WaterStatus;
  device_status: DeviceStatus;
  latest_reading: Reading | null;
}

export interface Reading {
  id: number;
  device_id: string;
  tank_id: number;
  distance_cm: number;
  water_depth_cm: number;
  water_level_percent: number;
  wifi_rssi: number | null;
  is_valid: boolean;
  received_at: string;
}

export interface Alert {
  id: number;
  tank_id: number;
  alert_type: 'low_water' | 'critical_water' | 'overflow_risk' | 'device_offline';
  severity: 'warning' | 'critical';
  message: string;
  is_acknowledged: boolean;
  is_resolved: boolean;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  last_reading_percent: number | null;
}

export interface Device {
  id: number;
  device_id: string;
  tank_id: number;
  status: string;
  last_seen_at: string | null;
  created_at: string;
  is_online: boolean;
}

export interface DashboardSummary {
  total_tanks: number;
  critical_alerts: number;
  healthy_tanks: number;
  offline_devices: number;
  last_updated: string;
}

export interface TankStatusItem {
  tank_id: number;
  name: string;
  location: string;
  water_level_percent: number | null;
  status: WaterStatus;
  device_status: DeviceStatus;
  last_reading_at: string | null;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  tanks: TankStatusItem[];
}
