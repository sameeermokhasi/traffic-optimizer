from typing import TypedDict, Optional, List

class VehicleCounts(TypedDict):
    N: int
    S: int
    E: int
    W: int

class CongestionReport(TypedDict):
    priority_order: List[str]
    severity: str
    reasoning: str

class SignalPlan(TypedDict):
    N: int
    S: int
    E: int
    W: int
    total_cycle: int

class Metrics(TypedDict):
    avg_wait_fixed: float
    avg_wait_optimized: float
    improvement_percent: float

class EmergencyState(TypedDict):
    active: bool
    route: str          # "N", "S", "E", or "W"
    vehicle_type: str   # "AMBULANCE", "FIRE", "POLICE"
    message: str

class TrafficState(TypedDict):
    vehicle_counts: VehicleCounts
    congestion_report: Optional[CongestionReport]
    signal_plan: Optional[SignalPlan]
    metrics: Optional[Metrics]
    cycle_number: int
    emergency: Optional[EmergencyState]
