from pymongo import MongoClient

MONGO_URL = "mongodb+srv://johanh1537_db_user:PoachAIMONEYAGENT@cluster0.tavzohv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "ai_money_agent"

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

print("\n📋 USERS IN DATABASE:")
for user in db["users"].find({}, {"email": 1, "role": 1, "_id": 0}):
    print(user)

client.close()
print("\n✅ Done — check above for admin@aimoneyagent.com")
