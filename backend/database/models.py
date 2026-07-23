from dataclasses import dataclass


@dataclass
class User:
    id: int
    username: str
    email: str
    password: str


@dataclass
class InspectionResult:
    id: int
    user_id: int
    filename: str
    status: str
    score: float
