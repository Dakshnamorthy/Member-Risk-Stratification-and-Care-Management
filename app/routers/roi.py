from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.member import Member
from app.services.ml_service import predict_risk
from app.services.roi_service import calculate_roi

router = APIRouter(prefix="/roi", tags=["ROI"])


@router.get("/{member_id}")
def get_roi(member_id: str, db: Session = Depends(get_db)):

    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # ✅ Get ML prediction
    risk, tier, probs = predict_risk(member)

    risk_90d = probs["90d"]

    # ✅ Calculate ROI
    roi = calculate_roi(member, risk_90d, tier)

    return {
        "member_id": member_id,
        "risk_tier_model": tier,
        "risk_tier_business": roi["mapped_tier"],
        "risk_90d": float(risk_90d),
        "roi": roi
    }