from fastapi import APIRouter

router = APIRouter()

inspection_history = []

@router.get("/history")
def get_history():
    return inspection_history

@router.post("/history")
def add_history(data: dict):
    inspection_history.append(data)
    return {"message": "Saved Successfully"}