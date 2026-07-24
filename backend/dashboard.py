from fastapi import APIRouter
from database import history_collection

router = APIRouter()


@router.get("/dashboard")
def dashboard():

    total = history_collection.count_documents({})

    defects = history_collection.count_documents({
        "defect": "Defective"
    })

    no_defects = history_collection.count_documents({
        "defect": "No Defect"
    })

    accuracy = 0

    if total > 0:
        accuracy = round((no_defects / total) * 100, 2)

    recent = list(
        history_collection.find(
            {},
            {
                "_id": 0,
                "filename": 1,
                "defect": 1,
                "confidence": 1,
                "date": 1,
            },
        )
        .sort("_id", -1)
        .limit(5)
    )

    return {
        "total": total,
        "defects": defects,
        "no_defects": no_defects,
        "accuracy": accuracy,
        "recent": recent,
    }