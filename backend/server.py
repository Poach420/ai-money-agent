from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from bson import ObjectId
import asyncio
import math

# ================== CONFIG ==================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection (with TLS for Render)
MONGO_URI = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "ai_money_agent")

client = AsyncIOMotorClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
db = client[DB_NAME]

# Environment variables
JWT_SECRET = os.environ.get("JWT_SECRET", "fallback-secret")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# FastAPI app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================== CORS ==================

origins = [
    "https://ai-money-agent-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== HELPERS ==================

def fix_object_ids(data):
    """Recursively convert ObjectId fields to strings so FastAPI can encode them."""
    if isinstance(data, list):
        return [fix_object_ids(item) for item in data]
    elif isinstance(data, dict):
        return {k: fix_object_ids(v) for k, v in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

# ================== MODELS ==================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password: Optional[str] = None
    name: str
    city: Optional[str] = None
    province: Optional[str] = None
    radius: int = 25
    job_types: List[str] = []
    skills: List[str] = []
    cv_files: List[Dict[str, str]] = []
    is_admin: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: str
    credits_remaining: int
    credits_monthly: int
    status: str = "active"
    next_billing_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Opportunity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    category: str
    source: str
    apply_url: str
    posted_at: str
    location: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    remote_flag: bool = False
    skills_required: List[str] = []

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    opportunity_id: str
    status: str = "Queued"
    cv_used: Optional[str] = None
    cover_letter: Optional[str] = None
    ai_prompt_used: Optional[str] = None
    match_score: Optional[int] = None
    requires_user_action: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ================== AUTH HELPERS ==================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def create_jwt(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["user_id"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# ================== ROUTES ==================

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Money Agent backend is running!"}

# ---------- HEALTH CHECK ROUTE ----------
@api_router.get("/")
async def api_root():
    return {"message": "AI Money Agent API active", "db": DB_NAME}

# ---------- SIGNUP ROUTE ----------
@api_router.post("/auth/signup")
async def signup(user: User):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user.password = hash_password(user.password or "123456")
    user_dict = user.model_dump()
    result = await db.users.insert_one(user_dict)

    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user = fix_object_ids(created_user)

    token = create_jwt(user.id)
    return {"status": "success", "token": token, "user": created_user}

# ---------- LOGIN ROUTE ----------
@api_router.post("/auth/login")
async def login(email: str, password: str):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(password, user.get("password", "")):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_jwt(user["id"])
    user = fix_object_ids(user)
    return {"status": "success", "token": token, "user": user}

# Register the router
app.include_router(api_router)
