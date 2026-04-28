import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)

SIGNAL_KEY = "traffic:current_signal"
METRICS_KEY = "traffic:current_metrics"
COUNTS_KEY = "traffic:current_counts"
CYCLE_KEY = "traffic:cycle_number"

def save_signal_state(signal_plan: dict, metrics: dict, counts: dict, cycle: int):
    pipe = r.pipeline()
    pipe.set(SIGNAL_KEY, json.dumps(signal_plan))
    pipe.set(METRICS_KEY, json.dumps(metrics))
    pipe.set(COUNTS_KEY, json.dumps(counts))
    pipe.set(CYCLE_KEY, cycle)
    pipe.execute()

def get_current_state() -> dict:
    signal = r.get(SIGNAL_KEY)
    metrics = r.get(METRICS_KEY)
    counts = r.get(COUNTS_KEY)
    cycle = r.get(CYCLE_KEY)
    return {
        "signal_plan": json.loads(signal) if signal else None,
        "metrics": json.loads(metrics) if metrics else None,
        "vehicle_counts": json.loads(counts) if counts else None,
        "cycle_number": int(cycle) if cycle else 0
    }

def ping_redis() -> bool:
    try:
        r.ping()
        return True
    except Exception:
        return False
