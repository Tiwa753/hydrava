from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
from database import get_db
from schemas import ReadingCreate, ReadingSubmitResponse
from services.alert_service import evaluate_and_update_alerts

router = APIRouter(tags=["readings"])


@router.post(
    "/readings",
    response_model=ReadingSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_reading(
    reading_in: ReadingCreate,
    db: Session = Depends(get_db),
) -> ReadingSubmitResponse:
    device = crud.get_device_by_device_id(db, reading_in.device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{reading_in.device_id}' not found",
        )

    tank = crud.get_tank(db, device.tank_id)
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank associated with device '{reading_in.device_id}' not found",
        )

    # Validate distance: sensor range 2.0cm to 400.0cm
    is_valid = 2.0 <= reading_in.distance_cm <= 400.0

    # Calculate water depth and percentage
    h_ref = tank.reference_height_cm
    raw_depth = h_ref - reading_in.distance_cm
    water_depth_cm = max(0.0, min(float(h_ref), float(raw_depth)))
    water_level_percent = (
        round((water_depth_cm / h_ref) * 100.0, 2) if h_ref > 0 else 0.0
    )

    reading = crud.create_reading(
        db=db,
        device_id=device.device_id,
        tank_id=tank.id,
        distance_cm=round(reading_in.distance_cm, 2),
        water_depth_cm=round(water_depth_cm, 2),
        water_level_percent=water_level_percent,
        wifi_rssi=reading_in.wifi_rssi,
        is_valid=is_valid,
    )

    if is_valid:
        evaluate_and_update_alerts(db, tank, water_level_percent)

    crud.update_device_seen(db, device.device_id, status="online")

    return ReadingSubmitResponse(
        success=True,
        device_id=device.device_id,
        received_at=reading.received_at,
    )
