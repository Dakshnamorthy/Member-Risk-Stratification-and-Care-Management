from pydantic import BaseModel


class UpdateFeatures(BaseModel):
    inpatient_admissions_12m: int
    inpatient_admissions_30d: int
    er_visits_90d: int
    er_visits_30d: int
    outpatient_visits_90d: int
    prescription_count_90d: int
    total_days_supply_90d: int
    total_healthcare_cost_90d: float
    cost_trend_90d_pct: float
    admission_trend_90d: int