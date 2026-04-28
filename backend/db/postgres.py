import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/trafficdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CycleLog(Base):
    __tablename__ = "cycle_logs"

    id              = Column(Integer, primary_key=True, index=True)
    cycle_number    = Column(Integer)
    vehicle_counts  = Column(JSON)
    signal_plan     = Column(JSON)
    congestion_report = Column(JSON)
    avg_wait_fixed  = Column(Float)
    avg_wait_optimized = Column(Float)
    improvement_percent = Column(Float)
    severity        = Column(String)
    created_at      = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_cycle(db, state: dict):
    metrics = state.get("metrics") or {}
    congestion = state.get("congestion_report") or {}
    log = CycleLog(
        cycle_number=state["cycle_number"],
        vehicle_counts=state["vehicle_counts"],
        signal_plan=state["signal_plan"],
        congestion_report=congestion,
        avg_wait_fixed=metrics.get("avg_wait_fixed", 0),
        avg_wait_optimized=metrics.get("avg_wait_optimized", 0),
        improvement_percent=metrics.get("improvement_percent", 0),
        severity=congestion.get("severity", "unknown")
    )
    db.add(log)
    db.commit()
    return log

def get_recent_logs(db, limit: int = 50):
    return db.query(CycleLog).order_by(CycleLog.created_at.desc()).limit(limit).all()
