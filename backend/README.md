# Hydrava Backend

## Setup
```bash
pip install -r requirements.txt
```

## Run (PowerShell)
From the repository root:
```powershell
cd .\backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Alternatively, run `.\backend\start.ps1` from the repository root. Both commands
use the backend virtual environment and do not reinstall dependencies.

## API Docs
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Staff accounts

Staff can create an account from the frontend sign-up page. The API stores a
password hash and uses the Staff ID as the unique account identifier:

- `POST /api/v1/auth/register` with `staff_id`, `full_name`, and `password`
- `POST /api/v1/auth/login` with `staff_id` and `password`

New self-registered accounts receive the `supervisor` role. Duplicate Staff IDs
return `409 Conflict`.

## Live sensor readings

Set `SIMULATOR_ENABLED=false` in `backend/.env` to prevent generated readings from
overwriting sensor data. The backend accepts device readings at `POST /api/v1/readings`;
the device must be registered in the database and send its `device_id`, `distance_cm`,
and optional `wifi_rssi`.

Example:
```bash
curl -X POST http://localhost:8000/api/v1/readings -H 'Content-Type: application/json' -d '{"device_id": "hydrava-node-001", "distance_cm": 36.0, "wifi_rssi": -55}'
```
