from fastapi import APIRouter
from pydantic import BaseModel
from database import users_collection

router = APIRouter()


# ------------------ MODELS ------------------ #

class LoginData(BaseModel):
    username: str
    password: str


class SignupData(BaseModel):
    username: str
    email: str
    password: str
    role: str


class ChangePassword(BaseModel):
    username: str
    currentPassword: str
    newPassword: str


class UpdateProfile(BaseModel):
    username: str
    email: str
    role: str


# ------------------ LOGIN ------------------ #

@router.post("/login")
def login(data: LoginData):

    user = users_collection.find_one(
        {"username": data.username}
    )

    if not user:
        return {
            "success": False,
            "message": "Invalid Username or Password"
        }

    if user["password"] != data.password:
        return {
            "success": False,
            "message": "Invalid Username or Password"
        }

    return {
        "success": True,
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    }


# ------------------ SIGNUP ------------------ #

@router.post("/signup")
def signup(data: SignupData):

    # ==========================================
    # Factory Supervisor Restriction
    # Only ONE Factory Supervisor is allowed
    # ==========================================

    if data.role == "Factory Supervisor":

        existing_supervisor = users_collection.find_one(
            {"role": "Factory Supervisor"}
        )

        if existing_supervisor:
            return {
                "success": False,
                "message": (
                    "Factory Supervisor account already exists. "
                    "Only one Factory Supervisor account is allowed."
                )
            }

    # ==========================================
    # Username Validation
    # ==========================================

    existing_user = users_collection.find_one(
        {"username": data.username}
    )

    if existing_user:
        return {
            "success": False,
            "message": "Username already exists"
        }

    # ==========================================
    # Create User
    # ==========================================

    users_collection.insert_one({
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "role": data.role
    })

    return {
        "success": True,
        "message": "Account created successfully"
    }


# ------------------ CHANGE PASSWORD ------------------ #

@router.post("/change-password")
def change_password(data: ChangePassword):

    user = users_collection.find_one(
        {"username": data.username}
    )

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    if user["password"] != data.currentPassword:
        return {
            "success": False,
            "message": "Current password is incorrect"
        }

    users_collection.update_one(
        {"username": data.username},
        {
            "$set": {
                "password": data.newPassword
            }
        }
    )

    return {
        "success": True,
        "message": "Password changed successfully"
    }


# ------------------ UPDATE PROFILE ------------------ #

@router.post("/update-profile")
def update_profile(data: UpdateProfile):

    user = users_collection.find_one(
        {"username": data.username}
    )

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    users_collection.update_one(
        {"username": data.username},
        {
            "$set": {
                "email": data.email,
                "role": data.role
            }
        }
    )

    return {
        "success": True,
        "message": "Profile updated successfully"
    }


# ------------------ GET USER ------------------ #

@router.get("/user/{username}")
def get_user(username: str):

    user = users_collection.find_one(
        {"username": username},
        {"_id": 0}
    )

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    return {
        "success": True,
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    }