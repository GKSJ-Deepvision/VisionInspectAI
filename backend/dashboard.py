from fastapi import APIRouter
from database import history_collection
from collections import Counter
from datetime import datetime

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

    # ---------------- Severity Counts ---------------- #

    critical = history_collection.count_documents({
        "severity": "High"
    })

    moderate = history_collection.count_documents({
        "severity": "Medium"
    })

    minor = history_collection.count_documents({
        "severity": "Low"
    })

    # ---------------- Average Confidence ---------------- #

    confidence_data = list(
        history_collection.find(
            {},
            {
                "_id": 0,
                "confidence": 1
            }
        )
    )

    average_confidence = 0

    if confidence_data:
        total_confidence = sum(
            item.get("confidence", 0)
            for item in confidence_data
        )

        average_confidence = round(
            total_confidence / len(confidence_data),
            2
        )

    # ---------------- Quality Score ---------------- #

    quality_score = 0

    if total > 0:
        quality_score = round(
            (no_defects / total) * 100,
            2
        )

    # ---------------- Recent Inspections ---------------- #

    recent = list(
        history_collection.find(
            {},
            {
                "_id": 0,
                "filename": 1,
                "defect": 1,
                "category": 1,
                "severity": 1,
                "risk": 1,
                "confidence": 1,
                "date": 1,
            }
        )
        .sort("_id", -1)
        .limit(5)
    )

    # ---------------- Trend Monitoring ---------------- #

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    counter = Counter()

    history = list(
        history_collection.find(
            {},
            {
                "_id": 0,
                "date": 1
            }
        )
    )

    for item in history:

        try:
            dt = datetime.strptime(
                item["date"],
                "%d-%m-%Y %I:%M %p"
            )

            counter[dt.strftime("%a")] += 1

        except:
            pass

    trend = []

    for day in days:

        trend.append({
            "day": day,
            "inspections": counter.get(day, 0)
        })


    # ---------------- Production Quality Report ---------------- #

    if quality_score >= 90:
        production_status = "Excellent"
    elif quality_score >= 75:
        production_status = "Good"
    elif quality_score >= 60:
        production_status = "Average"
    else:
        production_status = "Poor"


    # ---------------- Quality Risk Assessment ---------------- #

    if critical >= 5:
        overall_risk = "High Risk"
    elif moderate >= 5:
        overall_risk = "Medium Risk"
    else:
        overall_risk = "Low Risk"

    # ---------------- Dashboard Response ---------------- #

    return {

    "total": total,

    "defects": defects,

    "no_defects": no_defects,

    "critical": critical,

    "moderate": moderate,

    "minor": minor,

    "average_confidence": average_confidence,

    "quality_score": quality_score,

    "recent": recent,

    "trend": trend,

    "production_status": production_status,

    "overall_risk": overall_risk,
}