from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()

USERS_FILE = "users.json"

# Create users.json if not exists
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w") as f:
        json.dump({}, f, indent=4)


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


# ------------------ FUNCTIONS ------------------ #

def load_users():
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)


# ------------------ LOGIN ------------------ #

@router.post("/login")
def login(data: LoginData):

    users = load_users()

    if data.username not in users:
        return {
            "success": False,
            "message": "Invalid Username or Password"
        }

    user = users[data.username]

    if user["password"] != data.password:
        return {
            "success": False,
            "message": "Invalid Username or Password"
        }

    return {
        "success": True,
        "username": data.username,
        "email": user["email"],
        "role": user["role"]
    }


# ------------------ SIGNUP ------------------ #

@router.post("/signup")
def signup(data: SignupData):

    users = load_users()

    if data.username in users:
        return {
            "success": False,
            "message": "Username already exists"
        }

    users[data.username] = {
        "email": data.email,
        "password": data.password,
        "role": data.role
    }

    save_users(users)

    return {
        "success": True,
        "message": "Account created successfully"
    }


# ------------------ CHANGE PASSWORD ------------------ #

@router.post("/change-password")
def change_password(data: ChangePassword):

    users = load_users()

    if data.username not in users:
        return {
            "success": False,
            "message": "User not found"
        }

    if users[data.username]["password"] != data.currentPassword:
        return {
            "success": False,
            "message": "Current password is incorrect"
        }

    users[data.username]["password"] = data.newPassword

    save_users(users)

    return {
        "success": True,
        "message": "Password changed successfully"
    }


# ------------------ UPDATE PROFILE ------------------ #

@router.post("/update-profile")
def update_profile(data: UpdateProfile):

    users = load_users()

    if data.username not in users:
        return {
            "success": False,
            "message": "User not found"
        }

    users[data.username]["email"] = data.email
    users[data.username]["role"] = data.role

    save_users(users)

    return {
        "success": True,
        "message": "Profile updated successfully"
    }


# ------------------ GET USER ------------------ #

@router.get("/user/{username}")
def get_user(username: str):

    users = load_users()

    if username not in users:
        return {
            "success": False,
            "message": "User not found"
        }

    user = users[username]

    return {
        "success": True,
        "username": username,
        "email": user["email"],
        "role": user["role"]
    }