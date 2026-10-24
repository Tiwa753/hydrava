from sqlalchemy.orm import Session
import crud
from models import Tank


def evaluate_and_update_alerts(
    db: Session, tank: Tank, water_level_percent: float
) -> None:
    """Evaluate current water level against tank thresholds and update alert states."""
    active_critical = crud.get_active_alert_for_tank(db, tank.id, "critical_water")
    active_low = crud.get_active_alert_for_tank(db, tank.id, "low_water")
    active_overflow = crud.get_active_alert_for_tank(db, tank.id, "overflow_risk")

    if water_level_percent <= tank.critical_threshold_percent:
        # Critical water level
        if not active_critical:
            crud.create_alert(
                db=db,
                tank_id=tank.id,
                alert_type="critical_water",
                severity="critical",
                message=f"Water level critically low at {water_level_percent:.1f}%",
                last_reading_percent=round(water_level_percent, 2),
            )
        else:
            active_critical.last_reading_percent = round(water_level_percent, 2)
            active_critical.message = f"Water level critically low at {water_level_percent:.1f}%"
            db.commit()

        if active_low:
            crud.resolve_alert_obj(db, active_low)
        if active_overflow:
            crud.resolve_alert_obj(db, active_overflow)

    elif water_level_percent <= tank.low_threshold_percent:
        # Low water level warning
        if not active_low:
            crud.create_alert(
                db=db,
                tank_id=tank.id,
                alert_type="low_water",
                severity="warning",
                message=f"Water level low at {water_level_percent:.1f}%",
                last_reading_percent=round(water_level_percent, 2),
            )
        else:
            active_low.last_reading_percent = round(water_level_percent, 2)
            active_low.message = f"Water level low at {water_level_percent:.1f}%"
            db.commit()

        if active_critical:
            crud.resolve_alert_obj(db, active_critical)
        if active_overflow:
            crud.resolve_alert_obj(db, active_overflow)

    elif water_level_percent >= 95.0:
        # Overflow risk
        if not active_overflow:
            crud.create_alert(
                db=db,
                tank_id=tank.id,
                alert_type="overflow_risk",
                severity="critical",
                message=f"Overflow risk - tank at {water_level_percent:.1f}%",
                last_reading_percent=round(water_level_percent, 2),
            )
        else:
            active_overflow.last_reading_percent = round(water_level_percent, 2)
            active_overflow.message = f"Overflow risk - tank at {water_level_percent:.1f}%"
            db.commit()

        if active_low:
            crud.resolve_alert_obj(db, active_low)
        if active_critical:
            crud.resolve_alert_obj(db, active_critical)

    else:
        # Normal level - resolve any active water level alerts
        if active_critical:
            crud.resolve_alert_obj(db, active_critical)
        if active_low:
            crud.resolve_alert_obj(db, active_low)
        if active_overflow:
            crud.resolve_alert_obj(db, active_overflow)
