from datetime import datetime, timedelta, timezone
import random
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Alert, Device, Reading, Tank


def run_seed(db: Session) -> None:
    # Check idempotency
    existing_tank = db.scalars(
        select(Tank).where(Tank.name == "Male Hostel Water Tank")
    ).first()
    existing_device = db.scalars(
        select(Device).where(Device.device_id == "hydrava-node-001")
    ).first()
    if existing_tank or existing_device:
        print("[Seed] Seed tank or device already exists. Skipping.")
        return

    print("[Seed] Seeding database with initial tank, device, readings, and alerts...")
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # 1. Tank
    tank = Tank(
        name="Male Hostel Water Tank",
        location="Male Hostel Block A",
        reference_height_cm=120.0,
        low_threshold_percent=30.0,
        critical_threshold_percent=15.0,
        created_at=now - timedelta(days=7),
    )
    db.add(tank)
    db.flush()  # to obtain tank.id

    # 2. Device
    device = Device(
        device_id="hydrava-node-001",
        tank_id=tank.id,
        status="online",
        last_seen_at=now,
        created_at=now - timedelta(days=7),
    )
    db.add(device)
    db.flush()

    # 3. 7 days of historical readings (every 5 minutes = 2016 readings)
    rng = random.Random(42)  # Deterministic seed for repeatable test data
    total_ticks = 2016
    h_ref = tank.reference_height_cm
    readings: List[Reading] = []

    for i in range(total_ticks):
        tick_time = now - timedelta(minutes=5 * (total_ticks - 1 - i))

        # Multi-day pattern segments
        if i < 432:  # Day 1 to Day 2 midpoint: decrease 70% -> 20%
            t = i / 431.0
            base = 70.0 - 50.0 * t
        elif i < 1008:  # Day 2 midpoint refill 90% -> Day 4 midpoint 25%
            t = (i - 432) / 575.0
            base = 90.0 - 65.0 * t
        elif i < 1584:  # Day 4 midpoint refill 88% -> Day 6 midpoint 12%
            t = (i - 1008) / 575.0
            base = 88.0 - 76.0 * t
        else:  # Day 6 midpoint refill 92% -> Day 7 current ~65%
            t = (i - 1584) / 431.0
            base = 92.0 - 27.0 * t

        noise = rng.uniform(-2.0, 2.0)
        level = max(0.0, min(100.0, base + noise))

        distance_cm = h_ref * (1.0 - level / 100.0)
        water_depth_cm = h_ref - distance_cm
        is_valid = 2.0 <= distance_cm <= 400.0
        wifi_rssi = rng.randint(-75, -45)

        readings.append(
            Reading(
                device_id=device.device_id,
                tank_id=tank.id,
                distance_cm=round(distance_cm, 2),
                water_depth_cm=round(water_depth_cm, 2),
                water_level_percent=round(level, 2),
                wifi_rssi=wifi_rssi,
                is_valid=is_valid,
                received_at=tick_time,
            )
        )

    db.add_all(readings)

    # 4. Historical alerts
    alert1 = Alert(
        tank_id=tank.id,
        alert_type="low_water",
        severity="warning",
        message="Water level low at 24.5%",
        is_acknowledged=True,
        is_resolved=True,
        created_at=now - timedelta(days=3),
        acknowledged_at=now - timedelta(days=3) + timedelta(minutes=25),
        resolved_at=now - timedelta(days=3) + timedelta(hours=4),
        last_reading_percent=24.5,
    )
    alert2 = Alert(
        tank_id=tank.id,
        alert_type="critical_water",
        severity="critical",
        message="Water level critically low at 11.8%",
        is_acknowledged=True,
        is_resolved=True,
        created_at=now - timedelta(days=5),
        acknowledged_at=now - timedelta(days=5) + timedelta(minutes=15),
        resolved_at=now - timedelta(days=5) + timedelta(hours=6),
        last_reading_percent=11.8,
    )
    db.add_all([alert1, alert2])

    db.commit()
    print(f"[Seed] Successfully seeded 1 tank, 1 device, {len(readings)} readings, and 2 alerts.")


if __name__ == "__main__":
    from database import SessionLocal, init_db

    init_db()
    db_session = SessionLocal()
    try:
        run_seed(db_session)
    finally:
        db_session.close()
