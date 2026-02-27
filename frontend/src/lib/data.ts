
export const studies = [
    {
        id: "lung-cancer-screening",
        title: "Early Detection Lung Cancer Screening",
        slug: "lung-cancer-screening",
        status: "Recruiting",
        duration: "12 Months",
        location: "Hybrid (Remote + 2 Clinic Visits)",
        compensation: "$850",
        condition: "Oncology",
        age: "50-70",
        timeCommitment: "Low",
        country: "United States",
        sponsorId: "SP-ORG-001",
        supportStaff: ["staff-1@musbresearch.com", "staff-2@musbresearch.com"],
        description: "A pivotal study evaluating a new breath-based biomarker for the early detection of non-small cell lung cancer in high-risk individuals.",
        overview: "Lung cancer is most treatable when caught early. This study tests a non-invasive breathalyzer device designed to detect volatile organic compounds (VOCs) associated with lung cancer.",
        timeline: [
            { week: "Week 0", title: "Enrollment", desc: "Eligibility check, consent, and initial breath sample collection at home." },
            { week: "Month 6", title: "Follow-up", desc: "Brief virtual health check-in and symptom survey." },
            { week: "Month 12", title: "Final Visit", desc: "Clinic visit for standard low-dose CT scan (provided) and final breath sample." }
        ],
        kits: "Home breath collection device, prepaid shipping materials.",
        eligibility: {
            includes: ["Age 50-80", "Current or former smoker (quit within last 15 years)", "20+ pack-year smoking history"],
            excludes: ["Prior history of lung cancer", "Current respiratory infection", "Use of supplemental oxygen"]
        },
        safety: "This study is observational. The breath collection is non-invasive and carries no significant risk. CT scans are standard of care."
    },
    {
        id: "migraine-relief-wearable",
        title: "Wearable Neuromodulation for Migraine Relief",
        slug: "migraine-relief-wearable",
        status: "Recruiting",
        duration: "8 Weeks",
        location: "Remote",
        compensation: "$300 + Free Device",
        condition: "Neurology",
        age: "30-50",
        timeCommitment: "Medium",
        country: "Global",
        description: "Test a new headband device designed to reduce migraine frequency and intensity through gentle electrical stimulation.",
        overview: "Migraines affect millions worldwide. This study explores a drug-free alternative using non-invasive neuromodulation to target the trigeminal nerve.",
        timeline: [
            { week: "Week 1", title: "Baseline", desc: "Log migraine frequency and intensity in the app without using the device." },
            { week: "Week 2-8", title: "Active Phase", desc: "Wear the device for 20 minutes daily and during attacks. Log results." },
            { week: "Week 8", title: "Completion", desc: "Return device (or keep if eligible) and complete final satisfaction survey." }
        ],
        kits: "Neuromodulation headband, charging dock, user manual.",
        eligibility: {
            includes: ["4+ migraine days per month", "Diagnosed with migraine with or without aura", "Stable medication history"],
            excludes: ["Implanted metal or electrical devices in head/neck", "History of seizures", "Skin sensitivity on forehead"]
        },
        safety: "Device is FDA-cleared for safety. Mild tingling may occur during use."
    },
    {
        id: "t2d-dietary-intervention",
        title: "Virtual Dietary Intervention for Type 2 Diabetes",
        slug: "t2d-dietary-intervention",
        status: "Waitlist",
        duration: "6 Months",
        location: "Remote",
        compensation: "$500",
        condition: "Endocrinology",
        age: "50-70",
        timeCommitment: "High",
        country: "Canada",
        description: "Compare two digital nutrition programs for managing blood sugar levels in patients with recently diagnosed Type 2 Diabetes.",
        overview: "Can tailored nutrition plans replace medication for some patients? This study compares a ketogenic approach vs. a plant-based approach, delivered via a coaching app.",
        timeline: [
            { week: "Month 1", title: "Onboarding", desc: "Receive CGM (Continuous Glucose Monitor) and smart scale. Initial dietitian consult." },
            { week: "Month 2-5", title: "Intervention", desc: "Follow assigned diet plan, log meals, and attend weekly virtual coaching groups." },
            { week: "Month 6", title: "Results", desc: "Final blood work (at local lab) and program review." }
        ],
        kits: "Continuous Glucose Monitors (CGM) for 6 months,Smart scale, Recipe guide.",
        eligibility: {
            includes: ["Diagnosed T2D within last 3 years", "HbA1c between 6.5% and 9.0%", "BMI > 25"],
            excludes: ["Insulin use", "History of eating disorders", "Vegan/Vegetarian (for randomization purposes)"]
        },
        safety: "Dietary changes should be monitored. We coordinate with your PCP to adjust medications if blood sugar drops responsibly."
    },
    {
        id: "anxiety-vr-therapy",
        title: "VR-Based Exposure Therapy for Social Anxiety",
        slug: "anxiety-vr-therapy",
        status: "Recruiting",
        duration: "4 Weeks",
        location: "Remote",
        compensation: "$200",
        condition: "Mental Health",
        age: "18-30",
        timeCommitment: "Medium",
        country: "United Kingdom",
        description: "Evaluate the efficacy of a VR headset application in reducing social anxiety symptoms through controlled virtual exposure scenarios.",
        overview: "Social anxiety can be debilitating. This study utilizes Virtual Reality to simulate social situations (like parties or public speaking) in a safe environment to practice coping mechanisms.",
        timeline: [
            { week: "Week 0", title: "Setup", desc: "Receive VR headset. Complete baseline anxiety scales." },
            { week: "Week 1-4", title: "Sessions", desc: "Complete 3 VR sessions per week (20 mins each). Post-session mood logs." },
            { week: "Week 5", title: "Debrief", desc: "Return headset and final interview with a psychologist." }
        ],
        kits: "Oculus Quest 2 (loaner), Biofeedback sensor.",
        eligibility: {
            includes: ["Self-reported social anxiety", "Access to WiFi"],
            excludes: ["History of motion sickness/epilepsy", "Severe depression", "Current psychotherapy for anxiety"]
        },
        safety: "Cybersickness is a potential side effect. Users can stop immediately if uncomfortable."
    }
];

export const filters = {
    conditions: ["Oncology", "Neurology", "Endocrinology", "Mental Health", "Dermatology"],
    locations: ["Remote", "Hybrid"],
    countries: [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
        "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
        "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
        "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
        "Fiji", "Finland", "France",
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Global", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
        "Haiti", "Honduras", "Hungary",
        "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
        "Jamaica", "Japan", "Jordan",
        "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
        "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
        "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
        "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
        "Oman",
        "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
        "Qatar",
        "Romania", "Russia", "Rwanda",
        "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
        "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
        "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
        "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
        "Yemen",
        "Zambia", "Zimbabwe"
    ],
    ageRanges: ["18-30", "30-50", "50-70", "70+"],
    timeCommitment: ["Low", "Medium", "High"]
};
