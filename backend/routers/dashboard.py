from datetime import datetime, timezone
import os
from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud
from database import get_db
from schemas import DashboardResponse, DashboardSummary, TankStatusItem

router = APIRouter(tags=["dashboard"])

DEVICE_OFFLINE_TIMEOUT = float(os.getenv("DEVICE_OFFLINE_TIMEOUT_SECONDS", "30"))


def compute_dashboard_data(db: Session) -> DashboardResponse:
    tanks = crud.get_all_tanks(db)
    devices = crud.get_all_devices(db)
    active_alerts = crud.get_all_alerts(db, include_resolved=False)

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Calculate offline devices
    offline_devices_count = 0
    for device in devices:
        if (
            device.last_seen_at is None
            or (now - device.last_seen_at).total_seconds() >= DEVICE_OFFLINE_TIMEOUT
        ):
            offline_devices_count += 1

    # Calculate critical unresolved alerts
    critical_alerts_count = sum(1 for a in active_alerts if a.severity == "critical")

    tank_items: List[TankStatusItem] = []
    healthy_tanks_count = 0

    for tank in tanks:
        latest = crud.get_latest_reading_for_tank(db, tank.id)
        if latest:
            level = latest.water_level_percent
            if level <= tank.critical_threshold_percent:
                tank_status = "critical"
            elif level <= tank.low_threshold_percent:
                tank_status = "low"
            elif level >= 95.0:
                tank_status = "overflow_risk"
            else:
                tank_status = "normal"
            last_reading_at = latest.received_at
        else:
            level = None
            tank_status = "unknown"
            last_reading_at = None

        if tank_status == "normal":
            healthy_tanks_count += 1

        device_status = "unknown"
        if tank.devices:
            dev = tank.devices[0]
            if dev.last_seen_at is not None:
                diff = (now - dev.last_seen_at).total_seconds()
                device_status = "online" if diff < DEVICE_OFFLINE_TIMEOUT else "offline"

        tank_items.append(
            TankStatusItem(
                tank_id=tank.id,
                name=tank.name,
                location=tank.location,
                water_level_percent=level,
                status=tank_status,
                device_status=device_status,
                last_reading_at=last_reading_at,
            )
        )

    summary = DashboardSummary(
        total_tanks=len(tanks),
        critical_alerts=critical_alerts_count,
        healthy_tanks=healthy_tanks_count,
        offline_devices=offline_devices_count,
        last_updated=now.isoformat(),
    )

    return DashboardResponse(summary=summary, tanks=tank_items)


@router.get("/dashboard/summary", response_model=DashboardResponse)
def get_dashboard_summary(db: Session = Depends(get_db)) -> DashboardResponse:
    return compute_dashboard_data(db)


@router.get("/health")
def get_health() -> Dict[str, Any]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return {
        "status": "ok",
        "timestamp": now.isoformat(),
    }
