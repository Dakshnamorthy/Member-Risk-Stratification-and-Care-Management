import pandas as pd
import joblib

# ✅ Load models
model_30d = joblib.load("/Users/vishal/Desktop/risk_stratification_backend/ml_files/model_30d.pkl")
model_60d = joblib.load("/Users/vishal/Desktop/risk_stratification_backend/ml_files/model_60d.pkl")
model_90d = joblib.load("/Users/vishal/Desktop/risk_stratification_backend/ml_files/model_90d.pkl")

# ✅ SAFE gender → sex mapping
def map_gender(gender):
    if gender is None:
        return 1  # default male
    gender = str(gender).upper()
    if gender in ["M", "MALE"]:
        return 1
    elif gender in ["F", "FEMALE"]:
        return 0
    return 1  # fallback


# ✅ Build feature DataFrame (NO recursion, NO missing cols)
def build_feature_dataframe(member):
    data = {
        "age": member.age or 0,
        "sex": str(member.gender).upper() if member.gender else "M",

        "heart_failure": member.heart_failure or 0,
        "ckd": member.ckd or 0,
        "diabetes": member.diabetes or 0,
        "copd": member.copd or 0,
        "ischemic_heart_disease": member.ischemic_heart_disease or 0,
        "stroke": member.stroke or 0,
        "cancer": member.cancer or 0,
        "depression": member.depression or 0,

        "chronic_condition_count": member.chronic_condition_count or 0,

        "inpatient_admissions_12m": member.inpatient_admissions_12m or 0,
        "inpatient_admissions_90d": member.inpatient_admissions_90d or 0,
        "inpatient_admissions_30d": member.inpatient_admissions_30d or 0,

        "inpatient_days_12m": member.inpatient_days_12m or 0,
        "avg_inpatient_los": member.avg_inpatient_los or 0,
        "max_inpatient_los": member.max_inpatient_los or 0,
        "days_since_last_inpatient": member.days_since_last_inpatient or 0,

        "er_visits_90d": member.er_visits_90d or 0,
        "er_visits_30d": member.er_visits_30d or 0,
        "days_since_last_er": member.days_since_last_er or 0,

        "outpatient_visits_90d": member.outpatient_visits_90d or 0,
        "outpatient_visits_30d": member.outpatient_visits_30d or 0,

        "carrier_claims_90d": member.carrier_claims_90d or 0,
        "unique_physicians_90d": member.unique_physicians_90d or 0,

        "diagnosis_count_90d": member.diagnosis_count_90d or 0,
        "procedure_count_90d": member.procedure_count_90d or 0,

        "prescription_count_90d": member.prescription_count_90d or 0,
        "unique_drugs_90d": member.unique_drugs_90d or 0,
        "total_days_supply_90d": member.total_days_supply_90d or 0,

        "total_healthcare_cost_90d": member.total_healthcare_cost_90d or 0,
        "cost_trend_90d_pct": member.cost_trend_90d_pct or 0,
        "admission_trend_90d": member.admission_trend_90d or 0,
    }

    df = pd.DataFrame([data])

    # 🔍 Debug (remove later)
    print("FINAL INPUT:", df.columns.tolist())

    return df


# ✅ Predict probabilities
def predict_all(member):
    X = build_feature_dataframe(member)

    prob_30 = float(model_30d.predict_proba(X)[0][1])
    prob_60 = float(model_60d.predict_proba(X)[0][1])
    prob_90 = float(model_90d.predict_proba(X)[0][1])

    return prob_30, prob_60, prob_90


# ✅ Final risk calculation
def predict_risk(member):
    prob_30, prob_60, prob_90 = predict_all(member)

    risk_score = max(prob_30, prob_60, prob_90)

    risk_label = get_risk_label(risk_score)
    tier = get_tier(risk_score)

    return risk_label, tier, {
        "risk_score": float(risk_score),
        "30d": float(prob_30),
        "60d": float(prob_60),
        "90d": float(prob_90)
    }
    

def get_risk_label(score: float):
    if score < 0.3:
        return "LOW"
    elif score < 0.6:
        return "MEDIUM"
    elif score < 0.8:
        return "HIGH"
    else:
        return "CRITICAL"

def get_tier(score: float):
    if score < 0.3:
        return "TIER_1"
    elif score < 0.6:
        return "TIER_2"
    elif score < 0.8:
        return "TIER_3"
    else:
        return "TIER_4"