from fastapi import APIRouter

from backend.services.statistics import generate_statistics

router = APIRouter()


@router.get("/statistics")
def statistics():

    return generate_statistics()