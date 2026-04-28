from state import TrafficState, Metrics

try:
    from rag.memory import embed_cycle
except ImportError:
    def embed_cycle(*args, **kwargs): pass

def reporter_agent(state: TrafficState) -> TrafficState:
    counts = state["vehicle_counts"]
    plan = state["signal_plan"]

    def avg_wait(green_times: dict) -> float:
        total_vehicles = sum(counts.values())
        if total_vehicles == 0:
            return 0.0
        weighted = sum(counts[lane] * (130 - green_times[lane]) for lane in ["N", "S", "E", "W"])
        return round(weighted / total_vehicles, 2)

    fixed = {"N": 32.5, "S": 32.5, "E": 32.5, "W": 32.5}
    optimized = {k: plan[k] for k in ["N", "S", "E", "W"]}

    wait_fixed = avg_wait(fixed)
    wait_opt = avg_wait(optimized)
    improvement = round(((wait_fixed - wait_opt) / wait_fixed) * 100, 1) if wait_fixed > 0 else 0.0

    metrics: Metrics = {
        "avg_wait_fixed": wait_fixed,
        "avg_wait_optimized": wait_opt,
        "improvement_percent": improvement
    }

    # ── Memory: Embed this cycle for future semantic retrieval ─────────
    severity = state.get("congestion_report", {}).get("severity", "medium") if state.get("congestion_report") else "medium"
    embed_cycle(
        cycle_number=state.get("cycle_number", 0),
        counts=counts,
        signal_plan=plan,
        metrics=metrics,
        severity=severity
    )

    print(f"[Agent 4 - Reporter] Fixed: {wait_fixed}s | Optimized: {wait_opt}s | Saved: {improvement}%")
    return {**state, "metrics": metrics}
