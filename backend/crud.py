from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Alert, Device, Reading, Tank


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_tank(db: Session, tank_id: int) -> Optional[Tank]:
    return db.get(Tank, tank_id)


def get_all_tanks(db: Session) -> List[Tank]:
    stmt = select(Tank).order_by(Tank.id.asc())
    return list(db.scalars(stmt).all())


def get_device_by_device_id(db: Session, device_id: str) -> Optional[Device]:
    stmt = select(Device).where(Device.device_id == device_id)
    return db.scalars(stmt).first()


def update_device_seen(
    db: Session, device_id: str, status: str = "online"
) -> Optional[Device]:
    device = get_device_by_device_id(db, device_id)
    if device:
        device.status = status
        device.last_seen_at = utcnow()
        db.commit()
        db.refresh(device)
    return device


def create_reading(
    db: Session,
    device_id: str,
    tank_id: int,
    distance_cm: float,
    water_depth_cm: float,
    water_level_percent: float,
    wifi_rssi: Optional[int] = None,
    is_valid: bool = True,
) -> Reading:
    reading = Reading(
        device_id=device_id,
        tank_id=tank_id,
        distance_cm=distance_cm,
        water_depth_cm=water_depth_cm,
        water_level_percent=water_level_percent,
        wifi_rssi=wifi_rssi,
        is_valid=is_valid,
        received_at=utcnow(),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def get_readings_for_tank(
    db: Session, tank_id: int, limit: int = 200, since_hours: int = 24
) -> List[Reading]:
    stmt = select(Reading).where(Reading.tank_id == tank_id)
    if since_hours > 0:
        cutoff = utcnow() - timedelta(hours=since_hours)
        stmt = stmt.where(Reading.received_at >= cutoff)
    stmt = stmt.order_by(Reading.received_at.desc()).limit(limit)
    readings = list(db.scalars(stmt).all())
    readings.reverse()
    return readings


def get_latest_reading_for_tank(db: Session, tank_id: int) -> Optional[Reading]:
    stmt = (
        select(Reading)
        .where(Reading.tank_id == tank_id)
        .order_by(Reading.received_at.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()


def get_active_alert_for_tank(
    db: Session, tank_id: int, alert_type: str
) -> Optional[Alert]:
    stmt = (
        select(Alert)
        .where(
            Alert.tank_id == tank_id,
            Alert.alert_type == alert_type,
            Alert.is_resolved.is_(False),
        )
        .order_by(Alert.created_at.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()


def create_alert(
    db: Session,
    tank_id: int,
    alert_type: str,
    severity: str,
    message: str,
    last_reading_percent: Optional[float] = None,
) -> Alert:
    alert = Alert(
        tank_id=tank_id,
        alert_type=alert_type,
        severity=severity,
        message=message,
        last_reading_percent=last_reading_percent,
        is_acknowledged=False,
        is_resolved=False,
        created_at=utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def resolve_alert_obj(db: Session, alert: Alert) -> Alert:
    if not alert.is_resolved:
        alert.is_resolved = True
        alert.resolved_at = utcnow()
        db.commit()
        db.refresh(alert)
    return alert


def get_all_alerts(db: Session, include_resolved: bool = False) -> List[Alert]:
    stmt = select(Alert)
    if not include_resolved:
        stmt = stmt.where(Alert.is_resolved.is_(False))
    stmt = stmt.order_by(Alert.created_at.desc())
    return list(db.scalars(stmt).all())


def acknowledge_alert(
    db: Session,
    alert_id: int,
    is_acknowledged: Optional[bool] = None,
    is_resolved: Optional[bool] = None,
) -> Optional[Alert]:
    alert = db.get(Alert, alert_id)
    if not alert:
        return None
    now = utcnow()
    if is_acknowledged is not None:
        alert.is_acknowledged = is_acknowledged
        if is_acknowledged and not alert.acknowledged_at:
            alert.acknowledged_at = now
    if is_resolved is not None:
        alert.is_resolved = is_resolved
        if is_resolved and not alert.resolved_at:
            alert.resolved_at = now
    db.commit()
    db.refresh(alert)
    return alert


def get_all_devices(db: Session) -> List[Device]:
    stmt = select(Device).order_by(Device.id.asc())
    return list(db.scalars(stmt).all())
