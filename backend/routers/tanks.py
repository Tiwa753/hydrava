import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import crud
from database import get_db
from models import Device, Reading, Tank
from schemas import ReadingResponse, TankResponse, TankUpdate

router = APIRouter(tags=["tanks"])

DEVICE_OFFLINE_TIMEOUT = float(os.getenv("DEVICE_OFFLINE_TIMEOUT_SECONDS", "30"))


def compute_tank_status(tank: Tank, latest_reading: Optional[Reading]) -> str:
    if not latest_reading:
        return "unknown"
    level = latest_reading.water_level_percent
    if level <= tank.critical_threshold_percent:
        return "critical"
    if level <= tank.low_threshold_percent:
        return "low"
    if level >= 95.0:
        return "overflow_risk"
    return "normal"


def compute_device_status(devices: List[Device]) -> str:
    if not devices:
        return "unknown"
    # Evaluate primary device for this tank
    device = devices[0]
    if device.last_seen_at is None:
        return "unknown"
    return (
        "online"
        if crud.is_recent(device.last_seen_at, DEVICE_OFFLINE_TIMEOUT)
        else "offline"
    )


def build_tank_response(db: Session, tank: Tank) -> TankResponse:
    latest = crud.get_latest_reading_for_tank(db, tank.id)
    latest_schema = ReadingResponse.model_validate(latest) if latest else None
    return TankResponse(
        id=tank.id,
        name=tank.name,
        location=tank.location,
        reference_height_cm=tank.reference_height_cm,
        low_threshold_percent=tank.low_threshold_percent,
        critical_threshold_percent=tank.critical_threshold_percent,
        created_at=tank.created_at,
        latest_reading=latest_schema,
        current_status=compute_tank_status(tank, latest),
        device_status=compute_device_status(tank.devices),
    )


@router.get("/tanks", response_model=List[TankResponse])
def get_tanks(db: Session = Depends(get_db)) -> List[TankResponse]:
    tanks = crud.get_all_tanks(db)
    return [build_tank_response(db, tank) for tank in tanks]


@router.get("/tanks/{tank_id}", response_model=TankResponse)
def get_tank_by_id(tank_id: int, db: Session = Depends(get_db)) -> TankResponse:
    tank = crud.get_tank(db, tank_id)
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank with id {tank_id} not found",
        )
    return build_tank_response(db, tank)


@router.patch("/tanks/{tank_id}", response_model=TankResponse)
def update_tank(
    tank_id: int,
    update_data: TankUpdate,
    db: Session = Depends(get_db),
) -> TankResponse:
    tank = crud.get_tank(db, tank_id)
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank with id {tank_id} not found",
        )

    updates = update_data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one tank field must be provided",
        )
    if any(value is None for value in updates.values()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tank fields cannot be null",
        )

    low_threshold = updates.get(
        "low_threshold_percent", tank.low_threshold_percent
    )
    critical_threshold = updates.get(
        "critical_threshold_percent", tank.critical_threshold_percent
    )
    if critical_threshold >= low_threshold:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Critical threshold must be less than low threshold",
        )

    for field, value in updates.items():
        setattr(tank, field, value)
    db.commit()
    db.refresh(tank)
    return build_tank_response(db, tank)


@router.get("/tanks/{tank_id}/readings", response_model=List[ReadingResponse])
def get_tank_readings(
    tank_id: int,
    limit: int = Query(default=200, ge=1, le=5000),
    since_hours: int = Query(default=24, ge=0),
    db: Session = Depends(get_db),
) -> List[ReadingResponse]:
    tank = crud.get_tank(db, tank_id)
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank with id {tank_id} not found",
        )
    readings = crud.get_readings_for_tank(
        db, tank_id=tank_id, limit=limit, since_hours=since_hours
    )
    return [ReadingResponse.model_validate(r) for r in readings]
