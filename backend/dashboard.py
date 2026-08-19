from fastapi import APIRouter
from database import history_collection
from collections import Counter
from datetime import datetime

router = APIRouter()


@router.get("/dashboard")
def dashboard(
    username: str = "",
    role: str = ""
):

    # =========================================================
    # NORMALIZE USER / ROLE
    # =========================================================

    username = (username or "").strip()
    role = (role or "").strip()

    normalized_role = role.lower()

    # =========================================================
    # USER DATA FILTER
    # =========================================================
    #
    # Factory Supervisor / Supervisor:
    #   See ALL inspection data
    #
    # Quality Engineer:
    #   See only logged-in user's inspection data
    #
    # =========================================================

    supervisor_roles = {
        "supervisor",
        "factory supervisor",
    }

    if normalized_role in supervisor_roles:

        query = {}

    else:

        query = {
            "username": username
        }

    # =========================================================
    # BASIC COUNTS
    # =========================================================

    total = history_collection.count_documents(query)

    defects = history_collection.count_documents({
        **query,
        "defect": "Defective"
    })

    no_defects = history_collection.count_documents({
        **query,
        "defect": "No Defect"
    })

    # =========================================================
    # SEVERITY COUNTS
    # =========================================================

    critical = history_collection.count_documents({
        **query,
        "severity": "High"
    })

    moderate = history_collection.count_documents({
        **query,
        "severity": "Medium"
    })

    minor = history_collection.count_documents({
        **query,
        "severity": "Low"
    })

    # =========================================================
    # AVERAGE CONFIDENCE
    # =========================================================

    confidence_data = list(
        history_collection.find(
            query,
            {
                "_id": 0,
                "confidence": 1
            }
        )
    )

    average_confidence = 0

    if confidence_data:

        valid_confidences = []

        for item in confidence_data:

            confidence = item.get("confidence")

            if isinstance(confidence, (int, float)):

                valid_confidences.append(confidence)

        if valid_confidences:

            average_confidence = round(
                sum(valid_confidences) /
                len(valid_confidences),
                2
            )

    # =========================================================
    # QUALITY SCORE
    # =========================================================

    quality_score = 0

    if total > 0:

        quality_score = round(
            (no_defects / total) * 100,
            2
        )

    # =========================================================
    # RECENT INSPECTIONS
    # =========================================================

    recent = list(
        history_collection.find(
            query,
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

    # =========================================================
    # TREND MONITORING
    # =========================================================

    days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ]

    inspection_counter = Counter()
    passed_counter = Counter()
    failed_counter = Counter()

    history = list(
        history_collection.find(
            query,
            {
                "_id": 0,
                "date": 1,
                "defect": 1
            }
        )
    )

    for item in history:

        try:

            date_value = item.get("date")

            if not date_value:
                continue

            dt = datetime.strptime(
                date_value,
                "%d-%m-%Y %I:%M %p"
            )

            day = dt.strftime("%a")

            # Total inspections
            inspection_counter[day] += 1

            # Passed products
            if item.get("defect") == "No Defect":

                passed_counter[day] += 1

            # Failed products
            elif item.get("defect") == "Defective":

                failed_counter[day] += 1

        except (ValueError, TypeError):

            continue

    # =========================================================
    # INSPECTION ACTIVITY TREND
    # =========================================================

    trend = []

    for day in days:

        trend.append({
            "day": day,
            "inspections": inspection_counter.get(day, 0)
        })

    # =========================================================
    # QUALITY OUTCOME TREND
    # =========================================================

    outcome_trend = []

    for day in days:

        outcome_trend.append({
            "day": day,
            "passed": passed_counter.get(day, 0),
            "failed": failed_counter.get(day, 0)
        })

    # =========================================================
    # PRODUCTION STATUS
    # =========================================================

    if total == 0:

        production_status = "No Data"

    elif quality_score >= 90:

        production_status = "Excellent"

    elif quality_score >= 75:

        production_status = "Good"

    elif quality_score >= 60:

        production_status = "Average"

    else:

        production_status = "Poor"

    # =========================================================
    # QUALITY RISK ASSESSMENT
    # =========================================================

    if total == 0:

        overall_risk = "No Data"

    elif critical >= 5:

        overall_risk = "High Risk"

    elif moderate >= 5:

        overall_risk = "Medium Risk"

    else:

        overall_risk = "Low Risk"

    # =========================================================
    # DASHBOARD RESPONSE
    # =========================================================

    return {

        # USER INFORMATION
        "username": username,
        "role": role,

        # BASIC STATISTICS
        "total": total,
        "defects": defects,
        "no_defects": no_defects,

        # SEVERITY
        "critical": critical,
        "moderate": moderate,
        "minor": minor,

        # CONFIDENCE
        "average_confidence": average_confidence,

        # QUALITY SCORE
        "quality_score": quality_score,

        # RECENT INSPECTIONS
        "recent": recent,

        # TRENDS
        "trend": trend,
        "outcome_trend": outcome_trend,

        # STATUS
        "production_status": production_status,

        # RISK
        "overall_risk": overall_risk,
    }