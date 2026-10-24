from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import crud
from database import get_db
from schemas import AlertResponse, AlertUpdate

router = APIRouter(tags=["alerts"])


@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    include_resolved: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> List[AlertResponse]:
    alerts = crud.get_all_alerts(db, include_resolved=include_resolved)
    return [AlertResponse.model_validate(alert) for alert in alerts]


@router.patch("/alerts/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    update_data: AlertUpdate,
    db: Session = Depends(get_db),
) -> AlertResponse:
    alert = crud.acknowledge_alert(
        db=db,
        alert_id=alert_id,
        is_acknowledged=update_data.is_acknowledged,
        is_resolved=update_data.is_resolved,
    )
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with id {alert_id} not found",
        )
    return AlertResponse.model_validate(alert)
