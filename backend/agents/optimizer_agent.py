from state import TrafficState, SignalPlan

TOTAL_CYCLE = 130
MIN_GREEN = 10

def optimizer_agent(state: TrafficState) -> TrafficState:
    counts = state["vehicle_counts"]
    total = sum(counts.values())

    if total == 0:
        plan: SignalPlan = {"N": 32, "S": 33, "E": 32, "W": 33, "total_cycle": TOTAL_CYCLE}
    else:
        distributable = TOTAL_CYCLE - (MIN_GREEN * 4)
        plan: SignalPlan = {
            "N": MIN_GREEN + round((counts["N"] / total) * distributable),
            "S": MIN_GREEN + round((counts["S"] / total) * distributable),
            "E": MIN_GREEN + round((counts["E"] / total) * distributable),
            "W": MIN_GREEN + round((counts["W"] / total) * distributable),
            "total_cycle": TOTAL_CYCLE
        }

    print(f"[Agent 3 - Optimizer] N:{plan['N']}s  S:{plan['S']}s  E:{plan['E']}s  W:{plan['W']}s")
    return {**state, "signal_plan": plan}
