from state import TrafficState

def ingestion_agent(state: TrafficState) -> TrafficState:
    counts = state["vehicle_counts"]
    for lane in ["N", "S", "E", "W"]:
        counts[lane] = max(0, min(500, counts[lane]))
    total = sum(counts.values())
    print(f"[Agent 1 - Ingestion] Cycle {state['cycle_number']} | Total: {total} | {counts}")
    return {**state, "vehicle_counts": counts}
