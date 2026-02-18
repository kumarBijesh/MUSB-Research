from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MusB Research API",
    description="Backend for the Virtual Clinical Trial System",
    version="0.1.0"
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to MusB Research API",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Mock Data Endpoints
@app.get("/api/studies/")
def get_studies():
    return [
        {
            "id": "nad-longevity",
            "title": "NAD+ Longevity Trial",
            "description": "Investigating mitochondrial health.",
            "status": "recruiting",
            "duration": "90 Days",
            "location": "Global"
        },
        {
            "id": "sleep-patterns",
            "title": "Circadian Rhythm Study",
            "description": "Output monitoring for shift workers.",
            "status": "recruiting",
            "duration": "45 Days",
            "location": "Remote"
        }
    ]

@app.get("/api/certifications/")
def get_certifications():
    return [
        {"id": 1, "name": "HIPAA Compliant", "issuer": "HealthSec"},
        {"id": 2, "name": "GDPR Ready", "issuer": "EuroPriv"},
        {"id": 3, "name": "ISO 27001", "issuer": "IntlStd"}
    ]

@app.get("/api/partners/")
def get_partners():
    return [
        {"id": 1, "name": "HealthCorp", "type": "Pharma"},
        {"id": 2, "name": "BioGen", "type": "Biotech"},
        {"id": 3, "name": "UniMed", "type": "Academic"}
    ]

@app.get("/api/capabilities/")
def get_capabilities():
    return [
        {"id": 1, "title": "Decentralized Trials", "description": "Conduct research remotely."},
        {"id": 2, "title": "Patient Recruitment", "description": "AI-driven participant matching."},
        {"id": 3, "title": "Data Analytics", "description": "Real-time insights and reporting."}
    ]

@app.get("/api/facilities/")
def get_facilities():
    return [
        {"id": 1, "name": "Main Lab", "location": "Boston, MA"},
        {"id": 2, "name": "West Coast Hub", "location": "San Francisco, CA"}
    ]

@app.get("/api/home/settings/")
def get_home_settings():
    return {
        "hero_title": "Democratizing Clinical Research",
        "hero_subtitle": "Join the revolution of decentralized science.",
        "announcement": "New studies added weekly!"
    }
