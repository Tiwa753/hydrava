import asyncio
import os
import random
from datetime import datetime, timezone
import crud
from database import SessionLocal
from services.alert_service import evaluate_and_update_alerts

SIMULATOR_INTERVAL = float(os.getenv("SIMULATOR_INTERVAL_SECONDS", "15"))
OFFLINE_TIMEOUT = float(os.getenv("DEVICE_OFFLINE_TIMEOUT_SECONDS", "45"))


class SensorSimulator:
    def __init__(self) -> None:
        self.current_level = 65.0
        self.trend = -0.3
        self.tick = 0

    def next_level(self) -> float:
        self.tick += 1
        # Every 80 ticks: refill
        if self.tick % 80 == 0:
            self.current_level = random.uniform(85, 95)
            self.trend = -0.3
        # Every 40 ticks: speed up drain temporarily
        elif self.tick % 40 == 0:
            self.trend = -0.5

        noise = random.uniform(-1.5, 1.5)
        self.current_level = max(0.0, min(100.0, self.current_level + self.trend + noise))
        return self.current_level

    async def run(self) -> None:
        device_id = "hydrava-node-001"
        while True:
            try:
                level = self.next_level()
                db = SessionLocal()
                try:
                    device = crud.get_device_by_device_id(db, device_id)
                    if device and device.tank:
                        tank = device.tank
                        h_ref = tank.reference_height_cm
                        distance_cm = h_ref * (1.0 - level / 100.0)
                        water_depth_cm = h_ref - distance_cm
                        is_valid = 2.0 <= distance_cm <= 400.0
                        crud.create_reading(
                            db=db,
                            device_id=device_id,
                            tank_id=tank.id,
                            distance_cm=round(distance_cm, 2),
                            water_depth_cm=round(water_depth_cm, 2),
                            water_level_percent=round(level, 2),
                            wifi_rssi=random.randint(-75, -40),
                            is_valid=is_valid,
                        )
                        if is_valid:
                            evaluate_and_update_alerts(db, tank, level)
                        crud.update_device_seen(db, device_id, "online")
                        print(f"[Simulator] {device_id} -> {level:.1f}% ({distance_cm:.1f}cm)")
                finally:
                    db.close()
            except Exception as e:
                print(f"[Simulator] Error: {e}")
            await asyncio.sleep(SIMULATOR_INTERVAL)


simulator = SensorSimulator()
