from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.member import Member
from app.services.llm_service import generate_ai_summary

router = APIRouter(prefix="/members", tags=["Members"])


# =========================
# ✅ GET ALL MEMBERS (LIST VIEW)
# =========================
@router.get("/")
def get_members(
    skip: int = 0,
    limit: int = 50,
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        Member.member_id,
        Member.patient_name,
        Member.gender,
        Member.age,
        Member.risk_label,
        Member.tier
    )

    # 🔍 SEARCH
    if search:
        query = query.filter(
            Member.patient_name.ilike(f"%{search}%")
        )

    members = query.offset(skip).limit(limit).all()

    return [
        {
            "member_id": m.member_id,
            "name": m.patient_name,
            "gender": m.gender,
            "age": m.age,
            "risk": m.risk_label,
            "tier": m.tier
        }
        for m in members
    ]


# =========================
# ✅ GET SINGLE MEMBER (DETAIL VIEW)
# =========================
@router.get("/{member_id}")
def get_member_detail(member_id: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # 🧠 GENERATE AI SUMMARY ONLY IF NOT EXISTS
    if not member.ai_summary:
        ai_summary = generate_ai_summary(member)

        member.ai_summary = ai_summary
        db.commit()
        db.refresh(member)

    return {
        "member_id": member.member_id,
        "name": member.patient_name,
        "age": member.age,
        "gender": member.gender,

        "medical_data": {
            "diabetes": member.diabetes,
            "ckd": member.ckd,
            "heart_failure": member.heart_failure,
            "copd": member.copd,
            "cancer": member.cancer,
            "depression": member.depression,
            "chronic_condition_count": member.chronic_condition_count,
            "inpatient_admissions_12m": member.inpatient_admissions_12m,
            "er_visits_90d": member.er_visits_90d,
            "total_cost": member.total_healthcare_cost_90d
        },

        "risk": member.risk_label,
        "tier": member.tier,

        # ✅ FROM DB (cached)
        "ai_summary": member.ai_summary,

        # optional: keep rule-based explanation
        "explanation": generate_explanation(member)
    }


# =========================
# 🧠 OPTIONAL: FORCE REGENERATE AI SUMMARY
# =========================
@router.get("/{member_id}/ai-summary")
def regenerate_ai_summary(member_id: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    summary = generate_ai_summary(member)

    member.ai_summary = summary
    db.commit()
    db.refresh(member)

    return {
        "member_id": member.member_id,
        "ai_summary": summary
    }


# =========================
# 🧠 BASIC SUMMARY (OPTIONAL)
# =========================
def generate_summary(member):
    return f"""
    {member.patient_name} is a {member.age}-year-old patient with 
    {member.chronic_condition_count} chronic conditions. 
    Recent healthcare utilization includes {member.inpatient_admissions_12m} hospital admissions 
    and {member.er_visits_90d} ER visits.
    """


# =========================
# 🔍 EXPLAINABLE AI (RULE BASED)
# =========================
def generate_explanation(member):
    reasons = []

    if member.hospitalization_30d == 1:
        reasons.append("Recent hospitalization within 30 days")
    elif member.hospitalization_60d == 1:
        reasons.append("Recent hospitalization within 60 days")
    elif member.hospitalization_90d == 1:
        reasons.append("Recent hospitalization within 90 days")

    if member.inpatient_admissions_12m > 1:
        reasons.append("Frequent hospital admissions")

    if member.er_visits_90d > 2:
        reasons.append("High ER visits")

    if member.chronic_condition_count > 2:
        reasons.append("Multiple chronic conditions")

    if member.total_healthcare_cost_90d > 10000:
        reasons.append("High healthcare cost")

    return reasons