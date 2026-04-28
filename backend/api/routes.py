import sys, os, asyncio
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.postgres import get_db, log_cycle, get_recent_logs
from db.redis_client import get_current_state, save_signal_state, ping_redis
from graph.pipeline import run_pipeline
from api.websocket import manager

router = APIRouter()

# Global in-memory emergency state (single-node; would use Redis in prod)
_emergency_state = None

# ---------- Pydantic schemas ----------

class VehicleCountsInput(BaseModel):
    N: int
    S: int
    E: int
    W: int
    cycle_number: int = 1
    is_live_data: bool = False

class SimulationControl(BaseModel):
    action: str   # "start" | "stop"

class EmergencyInput(BaseModel):
    route: str        # "N" | "S" | "E" | "W"
    vehicle_type: str = "AMBULANCE"  # AMBULANCE | FIRE | POLICE

# ---------- Endpoints ----------

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "redis": ping_redis()
    }

@router.post("/intersection/update")
async def update_intersection(payload: VehicleCountsInput, db: Session = Depends(get_db)):
    """
    Receives vehicle counts from the simulator.
    Runs the full 4-agent pipeline, saves results, broadcasts to dashboard.
    """
    counts = {"N": payload.N, "S": payload.S, "E": payload.E, "W": payload.W}

    # Run the CPU/IO-bound pipeline in a thread so the async loop stays unblocked
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: run_pipeline(counts, payload.cycle_number, emergency=_emergency_state)
    )

    # Save to Redis (live state)
    save_signal_state(
        signal_plan=result["signal_plan"],
        metrics=result["metrics"],
        counts=counts,
        cycle=payload.cycle_number
    )

    # Save to PostgreSQL (history)
    log_cycle(db, result)

    # Build broadcast payload for dashboard
    broadcast_data = {
        "type": "cycle_update",
        "cycle": payload.cycle_number,
        "vehicle_counts": counts,
        "signal_plan": result["signal_plan"],
        "congestion_report": result["congestion_report"],
        "metrics": result["metrics"],
        "is_live_data": payload.is_live_data,
        "emergency": _emergency_state
    }

    # Push to all connected WebSocket clients
    await manager.broadcast(broadcast_data)

    return {"status": "ok", "cycle": payload.cycle_number, "metrics": result["metrics"], "signal_plan": result["signal_plan"]}

@router.get("/intersection/current")
async def get_current():
    """Returns the latest signal state from Redis."""
    state = get_current_state()
    if not state["signal_plan"]:
        raise HTTPException(status_code=404, detail="No data yet. Start the simulation first.")
    return state

@router.get("/metrics/history")
async def get_history(limit: int = 50, db: Session = Depends(get_db)):
    """Returns recent cycle logs from PostgreSQL for the charts."""
    logs = get_recent_logs(db, limit)
    return [
        {
            "id": log.id,
            "cycle": log.cycle_number,
            "vehicle_counts": log.vehicle_counts,
            "signal_plan": log.signal_plan,
            "avg_wait_fixed": log.avg_wait_fixed,
            "avg_wait_optimized": log.avg_wait_optimized,
            "improvement_percent": log.improvement_percent,
            "severity": log.severity,
            "timestamp": log.created_at.isoformat()
        }
        for log in logs
    ]

@router.get("/metrics/summary")
async def get_summary(db: Session = Depends(get_db)):
    """Returns overall stats across all cycles."""
    logs = get_recent_logs(db, 1000)
    if not logs:
        return {"message": "No cycles run yet"}
    improvements = [l.improvement_percent for l in logs]
    return {
        "total_cycles": len(logs),
        "avg_improvement_percent": round(sum(improvements) / len(improvements), 2),
        "best_improvement_percent": round(max(improvements), 2),
        "total_vehicles_processed": sum(
            sum(l.vehicle_counts.values()) for l in logs if l.vehicle_counts
        )
    }
@router.post("/emergency/trigger")
async def trigger_emergency(payload: EmergencyInput):
    """Activates emergency pre-emption mode for the given route."""
    global _emergency_state
    if payload.route not in ["N", "S", "E", "W"]:
        raise HTTPException(status_code=400, detail="route must be one of N, S, E, W")
    _emergency_state = {
        "active": True,
        "route": payload.route,
        "vehicle_type": payload.vehicle_type,
        "message": f"🚨 {payload.vehicle_type} detected on route {payload.route}. All signals overridden."
    }
    await manager.broadcast({"type": "emergency_alert", "emergency": _emergency_state})
    return {"status": "emergency activated", "emergency": _emergency_state}

@router.delete("/emergency/clear")
async def clear_emergency():
    """Deactivates emergency mode and restores normal AI pipeline."""
    global _emergency_state
    _emergency_state = None
    await manager.broadcast({"type": "emergency_cleared"})
    return {"status": "emergency cleared"}
