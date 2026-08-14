from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.member import Member
from app.schemas.predict_schema import UpdateFeatures
from app.services.ml_service import predict_risk


router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.put("/{member_id}")
def update_and_predict(
    member_id: str,
    updates: UpdateFeatures,
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # ✅ Only frontend fields updated
    member.inpatient_admissions_12m = updates.inpatient_admissions_12m
    member.inpatient_admissions_30d = updates.inpatient_admissions_30d
    member.er_visits_90d = updates.er_visits_90d
    member.er_visits_30d = updates.er_visits_30d
    member.outpatient_visits_90d = updates.outpatient_visits_90d
    member.prescription_count_90d = updates.prescription_count_90d
    member.total_days_supply_90d = updates.total_days_supply_90d
    member.total_healthcare_cost_90d = updates.total_healthcare_cost_90d
    member.cost_trend_90d_pct = updates.cost_trend_90d_pct
    member.admission_trend_90d = updates.admission_trend_90d

    db.commit()
    db.refresh(member)

    # ✅ Prediction
    risk, tier, probs = predict_risk(member)

    return {
        "member_id": member.member_id,
        "risk": risk,
        "tier": tier,
        "risk_score": probs["risk_score"],
        "probabilities": {
            "30d": probs["30d"],
            "60d": probs["60d"],
            "90d": probs["90d"]
        }
    }