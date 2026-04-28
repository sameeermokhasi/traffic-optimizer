from langgraph.graph import StateGraph, END
from state import TrafficState
from agents.ingestion_agent import ingestion_agent
from agents.congestion_agent import congestion_agent
from agents.optimizer_agent import optimizer_agent
from agents.reporter_agent import reporter_agent
from agents.emergency_agent import emergency_agent

# Conditional router: if emergency active, skip AI chain and go straight to emergency override
def route_after_ingestion(state: dict) -> str:
    emergency = state.get("emergency")
    if emergency and emergency.get("active"):
        return "emergency_override"
    return "congestion"

def build_pipeline():
    graph = StateGraph(TrafficState)
    graph.add_node("ingestion",         ingestion_agent)
    graph.add_node("congestion",        congestion_agent)
    graph.add_node("optimizer",         optimizer_agent)
    graph.add_node("reporter",          reporter_agent)
    graph.add_node("emergency_override", emergency_agent)

    graph.set_entry_point("ingestion")

    # Conditional branch: emergency skips the AI chain
    graph.add_conditional_edges(
        "ingestion",
        route_after_ingestion,
        {
            "congestion":        "congestion",
            "emergency_override": "emergency_override"
        }
    )

    # Normal AI path
    graph.add_edge("congestion",        "optimizer")
    graph.add_edge("optimizer",         "reporter")
    graph.add_edge("reporter",          END)

    # Emergency path goes directly to reporter (bypasses congestion/optimizer)
    graph.add_edge("emergency_override", "reporter")

    return graph.compile()

pipeline = build_pipeline()

def run_pipeline(vehicle_counts: dict, cycle_number: int, emergency: dict = None) -> dict:
    initial_state: TrafficState = {
        "vehicle_counts": vehicle_counts,
        "congestion_report": None,
        "signal_plan": None,
        "metrics": None,
        "cycle_number": cycle_number,
        "emergency": emergency
    }
    return pipeline.invoke(initial_state)
