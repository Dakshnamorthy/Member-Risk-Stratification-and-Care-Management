from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.member import Member

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# =========================
# 📊 SUMMARY CARDS
# =========================
@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    return {
        "total_patients": db.query(Member).count(),
        "high_risk": db.query(Member).filter(Member.risk_label == "HIGH").count(),
        "medium_risk": db.query(Member).filter(Member.risk_label == "MEDIUM").count(),
        "low_risk": db.query(Member).filter(Member.risk_label == "LOW").count(),
    }


# =========================
# 📊 RISK TIERS
# =========================
@router.get("/risk-tiers")
def get_risk_tiers(db: Session = Depends(get_db)):
    return {
        "very_high": db.query(Member).filter(Member.tier == "Tier 1").count(),
        "high": db.query(Member).filter(Member.tier == "Tier 2").count(),
        "moderate": db.query(Member).filter(Member.tier == "Tier 3").count(),
        "low": db.query(Member).filter(Member.tier == "Tier 4").count(),
    }


# =========================
# 🔥 WATCHLIST (TOP RISK)
# =========================
@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    members = db.query(Member).filter(
        Member.tier.in_(["Tier 1", "Tier 2"])
    ).limit(10).all()

    return [
        {
            "member_id": m.member_id,
            "name": m.patient_name,
            "risk": m.risk_label,
            "tier": m.tier
        }
        for m in members
    ]

# =========================
# 🥧 DISTRIBUTION (PIE CHART)
# =========================
@router.get("/distribution")
def get_distribution(db: Session = Depends(get_db)):
    mapping = {
        "Tier 1": "Very High",
        "Tier 2": "High",
        "Tier 3": "Moderate",
        "Tier 4": "Low",
    }

    result = []
    for tier_db, label in mapping.items():
        count = db.query(Member).filter(Member.tier == tier_db).count()
        result.append({
            "tier": label,
            "count": count
        })

    return result