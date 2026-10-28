import asyncio
from contextlib import asynccontextmanager
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI  # type: ignore[import-not-found]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import-not-found]
from database import SessionLocal, init_db
from routers.auth import router as auth_router
from routers.alerts import router as alerts_router
from routers.dashboard import router as dashboard_router
from routers.devices import router as devices_router
from routers.readings import router as readings_router
from routers.tanks import router as tanks_router
from routers.websocket import router as websocket_router
from seed import run_seed
from services.simulator import simulator

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed default data
    init_db()
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()

    # Launch sensor simulator task if enabled
    if os.getenv("SIMULATOR_ENABLED", "true").lower() == "true":
        asyncio.create_task(simulator.run())

    yield
    # Shutdown logic (if any)


app = FastAPI(
    title="Hydrava API",
    version="1.0.0",
    description="Hydrava Smart Water Level Monitoring & Alerting System API",
    lifespan=lifespan,
)

# CORS configuration
cors_env = os.getenv("CORS_ORIGINS", '["http://localhost:3000","http://localhost:3001"]')
try:
    origins = json.loads(cors_env)
except Exception:
    origins = ["http://localhost:3000", "http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with /api/v1 prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(readings_router, prefix="/api/v1")
app.include_router(tanks_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(devices_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(websocket_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Hydrava API",
        "version": "1.0.0",
        "docs": "/docs",
    }
