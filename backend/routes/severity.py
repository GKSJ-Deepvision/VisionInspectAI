from fastapi import APIRouter

router = APIRouter()


def calculate_severity(score: int):
    """
    Calculate severity level based on anomaly score.
    """

    if score <= 30:
        level = "Low"
    elif score <= 70:
        level = "Medium"
    else:
        level = "High"

    return {
        "severity_score": score,
        "severity_level": level
    }


@router.get("/severity")
def get_severity(score: int):

    severity = calculate_severity(score)

    return {
        "status": "Defective",
        "severity_score": severity["severity_score"],
        "severity_level": severity["severity_level"]
    }