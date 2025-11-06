from pymongo import MongoClient
import bcrypt

# ============================================================
# ⚔️ DIGITAL NINJA — RESET ADMIN SCRIPT for AI Money Agent (Final Fix)
# ============================================================

MONGO_URL = "mongodb+srv://johanh1537_db_user:PoachAIMONEYAGENT@cluster0.tavzohv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "ai_money_agent"

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# 🧹 Clear all users
deleted = db["users"].delete_many({})
print(f"🧹 Deleted {deleted.deleted_count} existing users.")

# 🔐 Create hashed admin password (store as raw bytes converted to utf8-safe string)
password_plain = "Ninja123!"
hashed_bytes = bcrypt.hashpw(password_plain.encode("utf-8"), bcrypt.gensalt())
hashed = hashed_bytes.decode("utf-8") if isinstance(hashed_bytes, bytes) else hashed_bytes

# 👑 Insert fresh admin account
admin_user = {
    "email": "admin@aimoneyagent.com",
    "password": hashed,
    "role": "admin",
    "vip": True,
    "status": "active"
}
db["users"].insert_one(admin_user)
print("✅ Created admin@aimoneyagent.com / Ninja123! (VIP admin).")

# 🔎 Verify it works
stored = db["users"].find_one({"email": "admin@aimoneyagent.com"})
if bcrypt.checkpw(password_plain.encode("utf-8"), stored["password"].encode("utf-8")):
    print("✅ Hash verified successfully (ready for login).")
else:
    print("❌ Hash verification failed (check encoding).")

client.close()
print("🚀 Reset complete. Try login again now.")
