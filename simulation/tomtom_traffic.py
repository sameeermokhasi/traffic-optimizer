import time
import random
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

# Load env variables from backend folder
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
load_dotenv(dotenv_path)

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")
BACKEND_URL = "http://localhost:8000/api/intersection/update"
DEFAULT_INTERVAL = 5

# Silk Board Junction Approach Coordinates (Bangalore)
COORDINATES = {
    "N": "12.9210,77.6230", # Hosur Road (North approach)
    "S": "12.9130,77.6250", # Hosur Road (South approach)
    "E": "12.9170,77.6280", # Outer Ring Road (East approach)
    "W": "12.9170,77.6200"  # BTM Layout (West approach)
}

API_QUOTA_EXCEEDED = False

def fetch_real_speed(lat_lon: str) -> dict:
    global API_QUOTA_EXCEEDED
    """Fetches real-time speed data from TomTom API."""
    if API_QUOTA_EXCEEDED or not TOMTOM_API_KEY or TOMTOM_API_KEY == "your_tomtom_api_key_here":
        return None
        
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={TOMTOM_API_KEY}&point={lat_lon}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            flow = data.get("flowSegmentData", {})
            return {
                "currentSpeed": flow.get("currentSpeed", 30),
                "freeFlowSpeed": flow.get("freeFlowSpeed", 40)
            }
        elif resp.status_code == 403:
            print("\n[!] TomTom API limit reached (403). Falling back to internal simulation engine for this session.\n")
            API_QUOTA_EXCEEDED = True
            return None
        else:
            print(f"[TomTom Error] Status {resp.status_code}")
            return None
    except Exception as e:
        print(f"[TomTom Error] Request failed: {e}")
        return None

def estimate_vehicles(speed_data: dict) -> int:
    """Converts speed congestion ratio to a vehicle count."""
    if not speed_data or speed_data["freeFlowSpeed"] == 0:
        # Fallback to random if no data
        return random.randint(10, 40)
        
    current = speed_data["currentSpeed"]
    free = speed_data["freeFlowSpeed"]
    
    ratio = current / free
    
    # Calculate vehicles based on how slow traffic is moving
    if ratio > 0.8:     # Fast moving (Light traffic)
        return random.randint(5, 15)
    elif ratio > 0.5:   # Slowing down (Medium traffic)
        return random.randint(15, 30)
    elif ratio > 0.2:   # Heavy traffic
        return random.randint(30, 60)
    else:               # Crawling (Critical traffic)
        return random.randint(60, 100)

def generate_counts() -> dict:
    """Collects vehicle counts for all 4 lanes."""
    counts = {}
    using_real_data = False
    
    for lane, coords in COORDINATES.items():
        speed_data = fetch_real_speed(coords)
        if speed_data:
            using_real_data = True
        counts[lane] = estimate_vehicles(speed_data)
        
    return counts, using_real_data

def run_simulation():
    print("=" * 55)
    print("  TOMTOM TRAFFIC SIMULATOR STARTED (Bangalore)")
    print(f"  Target: Silk Board Junction")
    print(f"  Sending data to: {BACKEND_URL}")
    if not TOMTOM_API_KEY or TOMTOM_API_KEY == "your_tomtom_api_key_here":
        print("  [!] MOCK MODE: No TomTom API key found. Using random data.")
    else:
        print("  [+] LIVE MODE: Fetching real Bangalore traffic speeds.")
    print("  Press Ctrl+C to stop")
    print("=" * 55)

    cycle = 1
    while True:
        counts, using_real_data = generate_counts()
        payload = {**counts, "cycle_number": cycle, "is_live_data": using_real_data}
        wait_time = DEFAULT_INTERVAL

        try:
            resp = requests.post(BACKEND_URL, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                metrics = data.get("metrics", {})
                plan = data.get("signal_plan", {})
                
                wait_time = DEFAULT_INTERVAL
                data_source = "LIVE TOMTOM DATA" if using_real_data else "MOCK DATA"

                print(f"\n[Cycle {cycle:04d}] {datetime.now().strftime('%H:%M:%S')} - {data_source}")
                print(f"  Vehicles:  N:{counts['N']}  S:{counts['S']}  E:{counts['E']}  W:{counts['W']}")
                print(f"  Improvement: {metrics.get('improvement_percent', 0)}%  "
                      f"(Fixed: {metrics.get('avg_wait_fixed', 0)}s → "
                      f"Optimized: {metrics.get('avg_wait_optimized', 0)}s)")
                print(f"  Waiting {wait_time}s for next cycle...")
            else:
                print(f"[Cycle {cycle}] Backend Error: {resp.status_code} — {resp.text}")

        except requests.exceptions.ConnectionError:
            print(f"[Cycle {cycle}] Cannot connect to backend. Is it running?")
        except Exception as e:
            print(f"[Cycle {cycle}] Unexpected error: {e}")

        cycle += 1
        time.sleep(wait_time)

if __name__ == "__main__":
    run_simulation()
