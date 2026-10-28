from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Tank(Base):
    __tablename__ = "tanks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    reference_height_cm: Mapped[float] = mapped_column(Float, nullable=False)
    low_threshold_percent: Mapped[float] = mapped_column(Float, default=30.0, nullable=False)
    critical_threshold_percent: Mapped[float] = mapped_column(Float, default=15.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    devices: Mapped[List["Device"]] = relationship("Device", back_populates="tank", cascade="all, delete-orphan")
    readings: Mapped[List["Reading"]] = relationship("Reading", back_populates="tank", cascade="all, delete-orphan")
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="tank", cascade="all, delete-orphan")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    tank_id: Mapped[int] = mapped_column(Integer, ForeignKey("tanks.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, default="unknown", nullable=False)
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    tank: Mapped["Tank"] = relationship("Tank", back_populates="devices")
    readings: Mapped[List["Reading"]] = relationship("Reading", back_populates="device", cascade="all, delete-orphan")


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[str] = mapped_column(String, ForeignKey("devices.device_id"), nullable=False, index=True)
    tank_id: Mapped[int] = mapped_column(Integer, ForeignKey("tanks.id"), nullable=False, index=True)
    distance_cm: Mapped[float] = mapped_column(Float, nullable=False)
    water_depth_cm: Mapped[float] = mapped_column(Float, nullable=False)
    water_level_percent: Mapped[float] = mapped_column(Float, nullable=False)
    wifi_rssi: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True, nullable=False)

    tank: Mapped["Tank"] = relationship("Tank", back_populates="readings")
    device: Mapped["Device"] = relationship("Device", back_populates="readings")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tank_id: Mapped[int] = mapped_column(Integer, ForeignKey("tanks.id"), nullable=False, index=True)
    alert_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True, nullable=False)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_reading_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tank: Mapped["Tank"] = relationship("Tank", back_populates="alerts")


class StaffAccount(Base):
    __tablename__ = "staff_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    staff_id: Mapped[str] = mapped_column(String(8), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="supervisor", nullable=False)
