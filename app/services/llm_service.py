import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_ai_summary(member):
    prompt = f"""
    You are a healthcare risk analyst.

    Patient Details:
    Name: {member.patient_name}
    Age: {member.age}
    Gender: {member.gender}

    Chronic Conditions: {member.chronic_condition_count}
    Inpatient Admissions (12m): {member.inpatient_admissions_12m}
    ER Visits (90d): {member.er_visits_90d}
    Healthcare Cost (90d): {member.total_healthcare_cost_90d}

    Risk Level: {member.risk_label}
    Tier: {member.tier}

    Explain:
    1. Why this patient is in this risk category
    2. Key contributing factors
    3. Suggested care actions

    Keep it short and clear.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",   # 🔥 best choice
        messages=[
            {"role": "system", "content": "You are a healthcare AI assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content