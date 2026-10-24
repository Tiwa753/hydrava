from datetime import datetime, timezone
import os
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud
from database import get_db
from schemas import DeviceResponse

router = APIRouter(tags=["devices"])

DEVICE_OFFLINE_TIMEOUT = float(os.getenv("DEVICE_OFFLINE_TIMEOUT_SECONDS", "30"))


@router.get("/devices", response_model=List[DeviceResponse])
def get_devices(db: Session = Depends(get_db)) -> List[DeviceResponse]:
    devices = crud.get_all_devices(db)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    responses = []
    for device in devices:
        is_online = (
            device.last_seen_at is not None
            and (now - device.last_seen_at).total_seconds() < DEVICE_OFFLINE_TIMEOUT
        )
        responses.append(
            DeviceResponse(
                id=device.id,
                device_id=device.device_id,
                tank_id=device.tank_id,
                status=device.status,
                last_seen_at=device.last_seen_at,
                created_at=device.created_at,
                is_online=is_online,
            )
        )
    return responses
