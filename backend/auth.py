from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginData(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginData):

    users = {
        "admin": {
            "password": "admin123",
            "role": "Admin"
        },
        "inspector": {
            "password": "inspect123",
            "role": "Inspector"
        }
    }

    if data.username in users:

        user = users[data.username]

        if data.password == user["password"]:

            return {
                "success": True,
                "role": user["role"]
            }

    return {
        "success": False,
        "message": "Invalid Username or Password"
    }