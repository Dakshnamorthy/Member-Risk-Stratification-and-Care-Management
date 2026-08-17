import pandas as pd
from app.database.database import SessionLocal
from app.models.member import Member

def calculate_risk(row):
    if row["hospitalization_30d"] == 1:
        return "HIGH", "Tier 1"
    elif row["hospitalization_60d"] == 1:
        return "MEDIUM", "Tier 2"
    elif row["hospitalization_90d"] == 1:
        return "LOW", "Tier 3"
    else:
        return "VERY LOW", "Tier 4"

# Load CSV
df = pd.read_csv("FINAL FIXED DATASET.csv")

db = SessionLocal()

for _, row in df.iterrows():
    risk_label, tier = calculate_risk(row)
    member = Member(
    member_id=str(row["member_id"]),
    patient_name=row["patient_name"],
    age=int(row["age"]),
    gender=row["sex"],  # important

    prediction_date=row["prediction_date"],

    heart_failure=row["heart_failure"],
    ckd=row["ckd"],
    diabetes=row["diabetes"],
    copd=row["copd"],
    ischemic_heart_disease=row["ischemic_heart_disease"],
    stroke=row["stroke"],
    cancer=row["cancer"],
    depression=row["depression"],

    chronic_condition_count=row["chronic_condition_count"],

    inpatient_admissions_12m=row["inpatient_admissions_12m"],
    inpatient_admissions_90d=row["inpatient_admissions_90d"],
    inpatient_admissions_30d=row["inpatient_admissions_30d"],

    inpatient_days_12m=row["inpatient_days_12m"],
    avg_inpatient_los=row["avg_inpatient_los"],
    max_inpatient_los=row["max_inpatient_los"],

    days_since_last_inpatient=row["days_since_last_inpatient"],

    er_visits_90d=row["er_visits_90d"],
    er_visits_30d=row["er_visits_30d"],
    days_since_last_er=row["days_since_last_er"],

    outpatient_visits_90d=row["outpatient_visits_90d"],
    outpatient_visits_30d=row["outpatient_visits_30d"],

    carrier_claims_90d=row["carrier_claims_90d"],
    unique_physicians_90d=row["unique_physicians_90d"],
    diagnosis_count_90d=row["diagnosis_count_90d"],
    procedure_count_90d=row["procedure_count_90d"],

    prescription_count_90d=row["prescription_count_90d"],
    unique_drugs_90d=row["unique_drugs_90d"],
    total_days_supply_90d=row["total_days_supply_90d"],

    total_healthcare_cost_90d=row["total_healthcare_cost_90d"],
    cost_trend_90d_pct=row["cost_trend_90d_pct"],
    admission_trend_90d=row["admission_trend_90d"],

    hospitalization_30d=row["hospitalization_30d"],
    hospitalization_60d=row["hospitalization_60d"],
    hospitalization_90d=row["hospitalization_90d"],
    risk_label=risk_label,
    tier=tier
    )

    db.add(member)

db.commit()
db.close()

print("✅ Data inserted successfully")

