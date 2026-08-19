from database import users_collection

# ============================
# Factory Supervisor Account
# ============================

supervisor = {
    "username": "factory_supervisor",
    "email": "supervisor@visioninspect.ai",
    "password": "Supervisor@123",
    "role": "Factory Supervisor"
}

# Check whether a Factory Supervisor already exists
existing_supervisor = users_collection.find_one(
    {"role": "Factory Supervisor"}
)

if existing_supervisor:
    print("Factory Supervisor account already exists.")

else:
    users_collection.insert_one(supervisor)
    print("Factory Supervisor account created successfully.")