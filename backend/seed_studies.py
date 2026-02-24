import asyncio
import motor.motor_asyncio
from datetime import datetime, timezone
import os
import sys

# Add the current directory to sys.path to import app
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))
# Actually, the base directory is backend/
sys.path.append(os.path.dirname(__file__))

from app.config import get_settings

settings = get_settings()

studies_data = [
    {
        "title": "Early Detection Lung Cancer Screening",
        "slug": "lung-cancer-screening",
        "status": "RECRUITING",
        "duration": "12 Months",
        "location": "Boston, MA",
        "locationType": "Hybrid",
        "compensation": "$850",
        "condition": "Oncology",
        "age": "50-70",
        "timeCommitment": "Low",
        "country": "United States",
        "description": "A pivotal study evaluating a new breath-based biomarker for the early detection of non-small cell lung cancer.",
        "overview": "Lung cancer is most treatable when caught early. This study tests a non-invasive breathalyzer device.",
        "timeline": [
            {"week": "Week 0", "title": "Enrollment", "desc": "Eligibility check and consent."},
            {"week": "Month 6", "title": "Follow-up", "desc": "Virtual check-in."},
            {"week": "Month 12", "title": "Final Visit", "desc": "Clinic visit for CT scan."}
        ],
        "kits": "Home breath collection kit.",
        "eligibilityRules": [
            {"question": "Are you aged 50-80?", "expectedAnswer": True, "ruleType": "INCLUSION"},
            {"question": "Are you a current or former smoker?", "expectedAnswer": True, "ruleType": "INCLUSION"}
        ],
        "safety": "Non-invasive collection carries no risk.",
        "createdAt": datetime.now(timezone.utc)
    },
    {
        "title": "Wearable Neuromodulation for Migraine Relief",
        "slug": "migraine-relief-wearable",
        "status": "RECRUITING",
        "duration": "8 Weeks",
        "location": "Remote",
        "locationType": "Remote",
        "compensation": "$300",
        "condition": "Neurology",
        "age": "30-50",
        "timeCommitment": "Medium",
        "country": "Global",
        "description": "Test a new headband device designed to reduce migraine frequency and intensity.",
        "overview": "Drug-free alternative using non-invasive neuromodulation.",
        "timeline": [
            {"week": "Week 1", "title": "Baseline", "desc": "Log migraines in app."},
            {"week": "Week 2-8", "title": "Active", "desc": "Use device daily."}
        ],
        "kits": "Neuromodulation headband.",
        "eligibilityRules": [
            {"question": "4+ migraine days per month?", "expectedAnswer": True, "ruleType": "INCLUSION"}
        ],
        "safety": "FDA-cleared device.",
        "createdAt": datetime.now(timezone.utc)
    },
    {
        "title": "VR-Based Exposure Therapy for Social Anxiety",
        "slug": "anxiety-vr-therapy",
        "status": "RECRUITING",
        "duration": "4 Weeks",
        "location": "London, UK",
        "locationType": "Remote",
        "compensation": "$200",
        "condition": "Mental Health",
        "age": "18-30",
        "timeCommitment": "Medium",
        "country": "United Kingdom",
        "description": "Evaluate efficacy of VR application in reducing social anxiety.",
        "overview": "Use VR to simulate social situations in a safe environment.",
        "timeline": [
            {"week": "Week 0", "title": "Setup", "desc": "Receive VR headset."},
            {"week": "Week 1-4", "title": "Sessions", "desc": "3 sessions per week."}
        ],
        "kits": "Oculus Quest 2 (loaner).",
        "eligibilityRules": [
            {"question": "History of seizures?", "expectedAnswer": False, "ruleType": "EXCLUSION"}
        ],
        "safety": "Potential cybersickness.",
        "createdAt": datetime.now(timezone.utc)
    }
]

async def seed():
    print(f"Connecting to: {settings.DATABASE_URL[:25]}...")
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]
    
    # Clear existing
    await db["studies"].delete_many({})
    print("Cleared existing studies.")
    
    # Insert new
    result = await db["studies"].insert_many(studies_data)
    print(f"Inserted {len(result.inserted_ids)} studies.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
