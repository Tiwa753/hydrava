import os
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud
from database import get_db
from schemas import DeviceResponse

router = APIRouter(tags=["devices"])

DEVICE_OFFLINE_TIMEOUT = float(os.getenv("DEVICE_OFFLINE_TIMEOUT_SECONDS", "45"))


@router.get("/devices", response_model=List[DeviceResponse])
def get_devices(db: Session = Depends(get_db)) -> List[DeviceResponse]:
    devices = crud.get_all_devices(db)
    responses = []
    for device in devices:
        responses.append(
            DeviceResponse(
                id=device.id,
                device_id=device.device_id,
                tank_id=device.tank_id,
                status=device.status,
                last_seen_at=device.last_seen_at,
                created_at=device.created_at,
                is_online=crud.is_recent(device.last_seen_at, DEVICE_OFFLINE_TIMEOUT),
            )
        )
    return responses
