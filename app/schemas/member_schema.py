from pydantic import BaseModel
from typing import Optional

class MemberListResponse(BaseModel):
    member_id: str
    patient_name: str
    age: int
    gender: str

    class Config:
        from_attributes = True

class MemberDetailResponse(BaseModel):
    member_id: str
    patient_name: str
    age: int
    gender: str
    state: str | None = None

    class Config:
        from_attributes = True

class MemberUpdate(BaseModel):
    inpatient_admissions_12m: Optional[int] = None
    inpatient_admissions_30d: Optional[int] = None
    er_visits_90d: Optional[int] = None
    er_visits_30d: Optional[int] = None
    outpatient_visits_90d: Optional[int] = None
    prescription_count_90d: Optional[int] = None
    total_days_supply_90d: Optional[int] = None
    total_healthcare_cost_90d: Optional[float] = None
    cost_trend_90d_pct: Optional[float] = None
    admission_trend_90d: Optional[float] = None
