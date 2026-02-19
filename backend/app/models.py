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


class UserBase(BaseModel):
    name: Optional[str] = None
    email: str
    role: str = UserRole.PARTICIPANT

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
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Study
# ---------------------------------------------------------------------------

class StudyBase(BaseModel):
    title: str
    description: str
    condition: Optional[str] = None
    location: Optional[str] = None
    compensation: Optional[str] = None
    status: str = "DRAFT"

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
    timezone: str = "UTC"
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ParticipantOut(ParticipantBase):
    id: str
    name: Optional[str] = None
    email: Optional[str] = None


# ---------------------------------------------------------------------------
# Screener
# ---------------------------------------------------------------------------

class ScreenerSubmit(BaseModel):
    studyId: str
    responses: dict[str, Any]


class ScreenerOut(BaseModel):
    id: str
    participantId: str
    isEligible: bool
    completedAt: datetime


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
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
