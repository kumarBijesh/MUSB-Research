from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field
from bson import ObjectId


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema):
        schema.update(type="string")
        return schema


# ---------------------------------------------------------------------------
# User / Auth
# ---------------------------------------------------------------------------

class UserRole:
    PARTICIPANT = "PARTICIPANT"
    COORDINATOR = "COORDINATOR"
    PI = "PI"
    DATA_MANAGER = "DATA_MANAGER"
    SPONSOR = "SPONSOR"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class UserBase(BaseModel):
    name: Optional[str] = None
    email: str
    role: str = UserRole.PARTICIPANT
    deviceFingerprint: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: str
    createdAt: datetime


class UserInDB(UserBase):
    id: Optional[str] = Field(default=None, alias="_id")
    passwordHash: Optional[str] = None
    emailVerified: Optional[datetime] = None
    deviceFingerprint: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Study
# ---------------------------------------------------------------------------

class StudyArm(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    name: str
    description: Optional[str] = None
    product: Optional[str] = None
    randomizationWeight: int = 1

class EligibilityRule(BaseModel):
    question: str
    expectedAnswer: Any
    ruleType: str = "INCLUSION"
    isRequired: bool = True

class Timepoint(BaseModel):
    dayOffset: int
    name: str # e.g., "Day 0", "Week 4"
    tasks: list[str] = []

class StudyBase(BaseModel):
    title: str
    slug: str
    description: str # Full Description
    shortDescription: Optional[str] = None # For study cards
    internalCode: Optional[str] = None
    coordinatorId: Optional[str] = None # The coordinator assigned to this study
    condition: Optional[str] = None
    location: Optional[str] = None
    locationType: str = "Remote" # Remote, Hybrid
    
    # Timing
    duration: Optional[str] = None
    durationUnit: str = "weeks" # weeks, months
    timeCommitment: Optional[str] = None
    
    # Eligibility & Enrollment
    minAge: int = 18
    maxAge: int = 100
    gender: str = "All" # All, Male, Female, Other
    inclusionCriteria: Optional[str] = None
    exclusionCriteria: Optional[str] = None
    targetParticipants: int = 100
    regions: list[str] = ["Global"]
    
    # Features
    activities: list[str] = [] # Surveys, logging, etc.
    isPaid: bool = False
    compensation: Optional[str] = None # Manual text override
    compensationAmount: Optional[float] = None
    compensationCurrency: str = "USD"
    compensationDescription: Optional[str] = None
    
    status: str = "DRAFT" # DRAFT, ACTIVE, COMPLETED
    
    # Detailed Content
    overview: Optional[str] = None
    timeline: list[dict] = [] # list of {week: str, title: str, desc: str}
    kits: Optional[str] = None
    safety: Optional[str] = None

    # Advanced Study Builder Fields
    designType: str = "Parallel"
    arms: list[StudyArm] = []
    eligibilityRules: list[EligibilityRule] = []
    timepoints: list[Timepoint] = []
    assessmentIds: list[str] = [] # IDs of Assessments to use
    randomizationEnabled: bool = False
    
    # Logistics Configuration
    kitType: Optional[str] = None # stool, blood, saliva, urine
    shippingRules: Optional[str] = None
    kitDetails: Optional[str] = None # Detailed kit contents
    instructions: Optional[str] = None # Usage instructions
    returnLabelRequired: bool = True
    
    # Safety Configuration
    safetyAlertsEnabled: bool = True
    immediateNotificationSeverity: str = "SEVERE"

    country: str = "Global" # Primary country
    consentLanguages: dict[str, str] = {} # e.g. {"US": "English...", "FR": "French..."}

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class StudyCreate(StudyBase):
    pass


class StudyOut(StudyBase):
    id: str
    createdAt: datetime


# ---------------------------------------------------------------------------
# Participant
# ---------------------------------------------------------------------------

class ParticipantBase(BaseModel):
    userId: str
    studyId: Optional[str] = None
    status: str = "LEAD"
    phone: Optional[str] = None
    phoneVerified: Optional[datetime] = None
    timezone: str = "UTC"
    dataResidency: str = "US" # US, EU, Asia (GDPR/Regional Requirement)
    notes: Optional[str] = None
    armId: Optional[str] = None
    consentedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ParticipantOut(ParticipantBase):
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    studyTitle: Optional[str] = None
    coordinatorId: Optional[str] = None # ID of the assigned study coordinator
    coordinatorName: Optional[str] = None # Name of the assigned study coordinator



# ---------------------------------------------------------------------------
# Screener & Consent
# ---------------------------------------------------------------------------

class ScreenerSubmit(BaseModel):
    studyId: str
    responses: dict[str, Any]


class ScreenerOut(BaseModel):
    id: str
    participantId: str
    isEligible: bool
    completedAt: datetime

class ConsentSign(BaseModel):
    studyId: str
    signatureData: str # Digital signature / Typed name
    ipAddress: Optional[str] = None

class ConsentOut(BaseModel):
    id: str
    participantId: str
    studyId: str
    signedAt: datetime

# ---------------------------------------------------------------------------
# Adverse Event
# ---------------------------------------------------------------------------

class AESeverity:
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    LIFE_THREATENING = "LIFE_THREATENING"


class AdverseEventCreate(BaseModel):
    description: str
    severity: str
    onsetDate: datetime
    actionTaken: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class AdverseEventOut(AdverseEventCreate):
    id: str
    participantId: str
    reportedAt: datetime
    status: str


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------

class TaskInstanceOut(BaseModel):
    id: str
    taskId: str
    title: str
    description: Optional[str] = None
    type: str
    status: str
    availableDate: datetime
    dueDate: datetime
    completedDate: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

class MessageCreate(BaseModel):
    receiverId: str
    content: str
    studyId: Optional[str] = None # Link message to a specific study


class MessageOut(BaseModel):
    id: str
    senderId: str
    receiverId: Optional[str] = None
    content: str
    read: bool
    createdAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ContactMessageCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    subject: str
    message: str


class ContactMessageOut(ContactMessageCreate):
    id: str
    createdAt: datetime
    read: bool

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

class DocumentOut(BaseModel):
    id: str
    participantId: str
    filename: str
    url: str
    category: Optional[str] = None
    uploadedAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------------------------------
# Auth Tokens
# ---------------------------------------------------------------------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class TokenData(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: Optional[str] = None
    modules: Optional[list] = []


# ---------------------------------------------------------------------------
# Audit Log (HIPAA)
# ---------------------------------------------------------------------------

class AuditLogCreate(BaseModel):
    userId: str
    action: str  # e.g., "LOGIN", "VIEW_PATIENT", "EXPORT_DATA"
    resource: str  # e.g., "Patient:12345"
    details: Optional[str] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None

class AuditLogOut(AuditLogCreate):
    id: str
    timestamp: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ---------------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------------

class AppointmentCreate(BaseModel):
    participantId: str
    coordinatorId: Optional[str] = None
    scheduledAt: datetime
    type: str = "Screening Call"
    status: str = "SCHEDULED" # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    notes: Optional[str] = None

class AppointmentOut(AppointmentCreate):
    id: str
    createdAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ---------------------------------------------------------------------------
# Kits & Inventory
# ---------------------------------------------------------------------------

class KitInstanceCreate(BaseModel):
    sku: str
    type: str # 'stool', 'blood', 'saliva'
    lotNumber: str
    expirationDate: datetime
    status: str = "AVAILABLE" # AVAILABLE, ASSIGNED, SHIPPED, RETURNED, EXPIRED

class KitInstanceOut(KitInstanceCreate):
    id: str
    assignedTo: Optional[str] = None
    shippedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
# ---------------------------------------------------------------------------
# Identity Verification
# ---------------------------------------------------------------------------

class VerificationRequest(BaseModel):
    identifier: str # Email or Phone
    type: str # "EMAIL" or "PHONE"
    purpose: Optional[str] = "LOGIN"  # LOGIN, REGISTER, RESET

class VerificationCheck(BaseModel):
    identifier: str
    code: str
    purpose: Optional[str] = "LOGIN"


class PasswordResetRequest(BaseModel):
    email: str
    newPassword: str
    code: str


class UpdatePassword(BaseModel):
    currentPassword: str
    newPassword: str
    code: Optional[str] = None # Optional OTP verification


# ---------------------------------------------------------------------------
# Assessments & Forms (ePRO)
# ---------------------------------------------------------------------------

class FormField(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    type: str # text, number, select, radio, date, scale
    label: str
    placeholder: Optional[str] = None
    options: Optional[list[str]] = None
    required: bool = True
    minValue: Optional[float] = None
    maxValue: Optional[float] = None

class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "General" # Gut Health, Sleep, Stress, etc.
    fields: list[FormField] = []

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentOut(AssessmentBase):
    id: str
    createdAt: datetime

class FormResponseCreate(BaseModel):
    assessmentId: str
    studyId: str
    responses: dict[str, Any]
    status: str = "COMPLETED" # COMPLETED, IN_PROGRESS

class FormResponseOut(FormResponseCreate):
    id: str
    participantId: str
    submittedAt: datetime

# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationBase(BaseModel):
    userId: str
    title: str
    content: str
    type: str = "INFO" # INFO, TASK, ALERT
    status: str = "UNREAD" # UNREAD, READ
    channel: str = "IN_APP" # IN_APP, EMAIL, SMS

class NotificationCreate(NotificationBase):
    pass

class NotificationOut(NotificationBase):
    id: str
    createdAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
