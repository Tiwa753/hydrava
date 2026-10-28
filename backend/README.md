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

To open the local frontend on a phone, connect both devices to the same Wi-Fi and
browse to `http://<computer-LAN-IP>:3000` (find the IP with `ipconfig`). The
frontend will use that same host for API and WebSocket requests; the backend
allows requests from private-network origins on ports 3000 and 3001. Allow those
ports through Windows Firewall if prompted.

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

## Public internet deployment (Netlify + Render)

The repository includes a Render Blueprint in `../render.yaml` for the API and
a managed PostgreSQL database. The database and non-free Render web service
incur charges according to the selected Render plans. Local SQLite data is not
automatically copied to the new PostgreSQL database.

1. Push the repository to GitHub and create a Render Blueprint from it. Render
   provisions `hydrava-api` and `hydrava-db`; the initial CORS origin list is
   empty.
2. Deploy the frontend on Netlify using the repository's `netlify.toml`.
   Set `NEXT_PUBLIC_API_URL` in the Netlify site environment to
   `https://<your-render-service>.onrender.com`, then trigger a new deploy.
   The frontend derives its WebSocket URL from this API URL.
3. In the Render `hydrava-api` environment, set `CORS_ORIGINS` to a JSON array
   containing the exact Netlify site origin, for example
   `["https://hydrava.netlify.app"]`, then redeploy/restart the service.
4. Open the Netlify HTTPS site, create an account, and sign in. The new
   PostgreSQL database starts empty; accounts in the local SQLite database
   must be created again unless you migrate them separately.

Self-registration is public and grants the `supervisor` role to every new
account. Before using this deployment with sensitive or real monitoring data,
add server-side authentication and authorization to the API: dashboard and
device endpoints currently do not enforce the frontend's browser-only session.
Public signup also has no email verification or rate limiting.

## Live sensor readings

Set `SIMULATOR_ENABLED=false` in `backend/.env` to prevent generated readings from
overwriting sensor data. The backend accepts device readings at `POST /api/v1/readings`;
the device must be registered in the database and send its `device_id`, `distance_cm`,
and optional `wifi_rssi`.

Example:
```bash
curl -X POST http://localhost:8000/api/v1/readings -H 'Content-Type: application/json' -d '{"device_id": "hydrava-node-001", "distance_cm": 36.0, "wifi_rssi": -55}'
```
