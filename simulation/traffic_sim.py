"""
Traffic Simulator — sends realistic vehicle counts to the backend every 5 seconds.
Run this AFTER the backend is running: python traffic_sim.py
"""

import time
import random
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:8000/api/intersection/update"
INTERVAL_SECONDS = 5

def get_time_profile() -> dict:
    """Returns weighted vehicle probabilities based on current hour."""
    hour = datetime.now().hour

    # Morning rush: 7am–10am → N/S heavy (people going to office/college)
    if 7 <= hour < 10:
        return {"N": (60, 100), "S": (50, 90), "E": (10, 30), "W": (5, 20)}

    # Afternoon: 12pm–2pm → moderate all around
    elif 12 <= hour < 14:
        return {"N": (20, 50), "S": (20, 50), "E": (20, 50), "W": (20, 50)}

    # Evening rush: 5pm–8pm → E/W heavy (return commute, market areas)
    elif 17 <= hour < 20:
        return {"N": (10, 30), "S": (10, 30), "E": (60, 110), "W": (50, 90)}

    # Night: 10pm–6am → very light
    elif hour >= 22 or hour < 6:
        return {"N": (0, 10), "S": (0, 10), "E": (0, 10), "W": (0, 10)}

    # Default: light traffic
    else:
        return {"N": (10, 40), "S": (10, 40), "E": (10, 40), "W": (10, 40)}

def generate_counts() -> dict:
    profile = get_time_profile()
    return {
        lane: random.randint(low, high)
        for lane, (low, high) in profile.items()
    }

def run_simulation():
    print("=" * 55)
    print("  TRAFFIC SIMULATOR STARTED")
    print(f"  Sending data to: {BACKEND_URL}")
    print(f"  Interval: every {INTERVAL_SECONDS} seconds")
    print("  Press Ctrl+C to stop")
    print("=" * 55)

    cycle = 1
    while True:
        counts = generate_counts()
        payload = {**counts, "cycle_number": cycle}

        wait_time = INTERVAL_SECONDS
        try:
            resp = requests.post(BACKEND_URL, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                metrics = data.get("metrics", {})
                plan = data.get("signal_plan", {})
                
                # Use real-time cycle wait if available
                wait_time = plan.get("total_cycle", INTERVAL_SECONDS)

                print(f"\n[Cycle {cycle:04d}] {datetime.now().strftime('%H:%M:%S')}")
                print(f"  Sent:      N:{counts['N']}  S:{counts['S']}  E:{counts['E']}  W:{counts['W']}")
                print(f"  Improvement: {metrics.get('improvement_percent', 0)}%  "
                      f"(Fixed: {metrics.get('avg_wait_fixed', 0)}s → "
                      f"Optimized: {metrics.get('avg_wait_optimized', 0)}s)")
                print(f"  Waiting {wait_time}s for real-time cycle completion...")
            else:
                print(f"[Cycle {cycle}] Error: {resp.status_code} — {resp.text}")

        except requests.exceptions.ConnectionError:
            print(f"[Cycle {cycle}] Cannot connect to backend. Is it running? (python -m uvicorn main:app)")

        except Exception as e:
            print(f"[Cycle {cycle}] Unexpected error: {e}")

        cycle += 1
        time.sleep(wait_time)

if __name__ == "__main__":
    run_simulation()
