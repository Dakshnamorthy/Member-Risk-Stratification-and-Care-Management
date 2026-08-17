import numpy as np

# ==============================
# CONFIG
# ==============================
COST_SCALE_FACTOR = 2.5
AVG_HOSPITALIZATION_COST_FLOOR = 12000

INTERVENTION_COST_BY_TIER = {
    "Very Low": 0,
    "Low": 0,
    "Moderate": 250,
    "High": 600,
    "Very High": 1200,
}

INTERVENTION_EFFECTIVENESS_BY_TIER = {
    "Very Low": 0.00,
    "Low": 0.00,
    "Moderate": 0.15,
    "High": 0.25,
    "Very High": 0.35,
}

ENROLLED_TIERS = ["Moderate", "High", "Very High"]

# ==============================
# 🔥 ML → BUSINESS TIER MAPPING
# ==============================
TIER_MAPPING = {
    "TIER_1": "Low",
    "TIER_2": "Moderate",
    "TIER_3": "High"
}


# ==============================
# ROI FUNCTION
# ==============================
def calculate_roi(member, risk_90d, risk_tier):

    # ✅ Convert ML tier → Business tier
    mapped_tier = TIER_MAPPING.get(risk_tier, "Low")

    # ==============================
    # 1️⃣ COST ESTIMATION
    # ==============================
    member_cost = float(member.total_healthcare_cost_90d or 0)

    expected_cost = max(
        member_cost * COST_SCALE_FACTOR,
        AVG_HOSPITALIZATION_COST_FLOOR
    )

    # ==============================
    # 2️⃣ INTERVENTION LOGIC
    # ==============================
    intervention_cost = INTERVENTION_COST_BY_TIER.get(mapped_tier, 0)
    effectiveness = INTERVENTION_EFFECTIVENESS_BY_TIER.get(mapped_tier, 0)

    enrolled = mapped_tier in ENROLLED_TIERS

    # ==============================
    # 3️⃣ ROI CALCULATION
    # ==============================
    risk_90d = float(risk_90d)

    cost_no_intervention = risk_90d * expected_cost

    cost_with_intervention = (
        risk_90d * (1 - effectiveness) * expected_cost
    )

    gross_savings = cost_no_intervention - cost_with_intervention

    # If not enrolled → no savings / cost
    if not enrolled:
        gross_savings = 0
        intervention_cost = 0

    net_savings = gross_savings - intervention_cost

    roi_pct = (
        (net_savings / intervention_cost) * 100
        if intervention_cost > 0 else None
    )

    # ==============================
    # 4️⃣ RETURN RESPONSE
    # ==============================
    return {
        "mapped_tier": mapped_tier,
        "expected_cost": float(expected_cost),
        "intervention_cost": float(intervention_cost),
        "gross_savings": float(gross_savings),
        "net_savings": float(net_savings),
        "roi_pct": float(roi_pct) if roi_pct is not None else None,
        "enrolled": enrolled
    }