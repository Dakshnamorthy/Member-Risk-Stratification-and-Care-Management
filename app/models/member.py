from sqlalchemy import Column, Integer, String, Float, DateTime,Text
from datetime import datetime, UTC

from app.database.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    member_id = Column(String, unique=True, index=True)
    patient_name = Column(String)
    age = Column(Integer)
    gender = Column(String)

    prediction_date = Column(String)

    # Chronic Conditions
    heart_failure = Column(Integer)
    ckd = Column(Integer)
    diabetes = Column(Integer)
    copd = Column(Integer)
    ischemic_heart_disease = Column(Integer)
    stroke = Column(Integer)
    cancer = Column(Integer)
    depression = Column(Integer)

    chronic_condition_count = Column(Integer)

    # Inpatient
    inpatient_admissions_12m = Column(Integer)
    inpatient_admissions_90d = Column(Integer)
    inpatient_admissions_30d = Column(Integer)

    inpatient_days_12m = Column(Integer)
    avg_inpatient_los = Column(Float)
    max_inpatient_los = Column(Float)

    days_since_last_inpatient = Column(Integer)

    # ER
    er_visits_90d = Column(Integer)
    er_visits_30d = Column(Integer)
    days_since_last_er = Column(Integer)

    # Outpatient
    outpatient_visits_90d = Column(Integer)
    outpatient_visits_30d = Column(Integer)

    # Claims & Pharmacy
    carrier_claims_90d = Column(Integer)
    unique_physicians_90d = Column(Integer)
    diagnosis_count_90d = Column(Integer)
    procedure_count_90d = Column(Integer)

    prescription_count_90d = Column(Integer)
    unique_drugs_90d = Column(Integer)
    total_days_supply_90d = Column(Integer)

    # Cost
    total_healthcare_cost_90d = Column(Float)
    cost_trend_90d_pct = Column(Float)
    admission_trend_90d = Column(Float)

    # Labels (Ground truth)
    hospitalization_30d = Column(Integer)
    hospitalization_60d = Column(Integer)
    hospitalization_90d = Column(Integer)

    risk_label=Column(String,nullable=True)
    tier=Column(String,nullable=True)

    ai_summary = Column(Text, nullable=True) 
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC),onupdate=lambda: datetime.now(UTC))