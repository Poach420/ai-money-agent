from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import os
import certifi
from pathlib import Path

# ====================================================
# ⚔️ DIGITAL NINJA — AI MONEY AGENT BACKEND v5.5 (Stable)
# ====================================================

# ---------- CONFIG ----------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URI = os.getenv("MONGO_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_EXP_MINUTES = 60 * 24 * 7  # 7 days

# ---------- APP SETUP ----------
app = FastAPI(title="AI Money Agent Backend")
auth_scheme = HTTPBearer()

# ✅ FIXED: Strict but correct CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-money-agent-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DATABASE ----------
print("🔍 Checking MongoDB connection...")
print(f"Connection string: {MONGO_URI}")

client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client["ai_money_agent"]

try:
    client.admin.command("ping")
    print("✅ MongoDB connection successful.")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# ---------- MODELS ----------
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ---------- HELPERS ----------
def create_jwt(user_id: str):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXP_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# ---------- ROUTES ----------
@app.get("/")
async def home():
    return {"message": "✅ AI Money Agent backend running!"}

@app.post("/api/auth/signup")
async def signup(data: UserSignup):
    try:
        print(f"🔍 Signup attempt for {data.email}")
        existing = await db.users.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = {
            "name": data.name,
            "email": data.email,
            "password": hashed_pw,
            "created_at": datetime.now(timezone.utc),
        }

        result = await db.users.insert_one(user)
        user["_id"] = str(result.inserted_id)

        token = create_jwt(user["_id"])
        print(f"✅ User created successfully: {user['email']}")
        return {"message": "User created successfully", "token": token, "user": user}

    except Exception as e:
        print(f"❌ Signup failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/api/auth/login")
async def login(data: UserLogin):
    try:
        user = await db.users.find_one({"email": data.email})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        if not bcrypt.checkpw(data.password.encode("utf-8"), user["password"].encode("utf-8")):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        token = create_jwt(str(user["_id"]))
        print(f"✅ Login successful for {data.email}")
        return {"message": "Login successful", "token": token}
    except Exception as e:
        print(f"❌ Login failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/users/me")
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user["_id"] = str(user["_id"])
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ====================================================
# ✅ END OF FILE
# ====================================================

@app.get("/health")
def health():
    return {"status":"ok"}

