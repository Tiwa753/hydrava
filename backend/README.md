# Hydrava Backend

## Setup
```bash
pip install -r requirements.txt
```

## Run
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Docs
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Live sensor readings

Set `SIMULATOR_ENABLED=false` in `backend/.env` to prevent generated readings from
overwriting sensor data. The backend accepts device readings at `POST /api/v1/readings`;
the device must be registered in the database and send its `device_id`, `distance_cm`,
and optional `wifi_rssi`.

Example:
```bash
curl -X POST http://localhost:8000/api/v1/readings -H 'Content-Type: application/json' -d '{"device_id": "hydrava-node-001", "distance_cm": 36.0, "wifi_rssi": -55}'
```
