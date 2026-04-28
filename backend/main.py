import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.postgres import create_tables
from api.routes import router
from api.websocket import manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: create DB tables
    print("[Startup] Creating database tables...")
    try:
        create_tables()
        print("[Startup] Tables ready.")
    except Exception as e:
        print(f"[Startup] DB warning: {e}")
    yield
    print("[Shutdown] Goodbye.")

app = FastAPI(
    title="Traffic Signal Optimizer API",
    description="Agentic AI system for adaptive traffic signal control",
    version="1.0.0",
    lifespan=lifespan
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all REST routes under /api
app.include_router(router, prefix="/api")

# WebSocket endpoint for live dashboard updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; server pushes data via broadcast
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "message": "Traffic Optimizer API is running",
        "docs": "/docs",
        "websocket": "ws://localhost:8000/ws"
    }
