from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReadingCreate(BaseModel):
    device_id: str
    distance_cm: float
    water_level_percent: Optional[float] = None
    wifi_rssi: Optional[int] = None


class ReadingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: str
    tank_id: int
    distance_cm: float
    water_depth_cm: float
    water_level_percent: float
    wifi_rssi: Optional[int] = None
    is_valid: bool
    received_at: datetime


class ReadingSubmitResponse(BaseModel):
    success: bool
    device_id: str
    received_at: datetime


class TankResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    location: str
    reference_height_cm: float
    low_threshold_percent: float
    critical_threshold_percent: float
    created_at: datetime
    latest_reading: Optional[ReadingResponse] = None
    current_status: str
    device_status: str


class TankUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    location: Optional[str] = Field(default=None, min_length=1)
    reference_height_cm: Optional[float] = Field(default=None, gt=0)
    low_threshold_percent: Optional[float] = Field(default=None, ge=0, le=100)
    critical_threshold_percent: Optional[float] = Field(default=None, ge=0, le=100)


class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: str
    tank_id: int
    status: str
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    is_online: bool


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tank_id: int
    alert_type: str
    severity: str
    message: str
    is_acknowledged: bool
    is_resolved: bool
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    last_reading_percent: Optional[float] = None


class AlertUpdate(BaseModel):
    is_acknowledged: Optional[bool] = None
    is_resolved: Optional[bool] = None


class DashboardSummary(BaseModel):
    total_tanks: int
    critical_alerts: int
    healthy_tanks: int
    offline_devices: int
    last_updated: str


class TankStatusItem(BaseModel):
    tank_id: int
    name: str
    location: str
    water_level_percent: Optional[float] = None
    status: str
    device_status: str
    last_reading_at: Optional[datetime] = None


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    tanks: List[TankStatusItem]


class StaffRegister(BaseModel):
    staff_id: str = Field(min_length=6, max_length=8, pattern=r"(?i)^[A-Z]{2,4}-\d{3}$")
    full_name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class StaffLogin(BaseModel):
    staff_id: str = Field(min_length=1, max_length=8)
    password: str = Field(min_length=1, max_length=128)


class StaffAccountResponse(BaseModel):
    staff_id: str
    name: str
    role: str
