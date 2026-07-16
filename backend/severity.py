from fastapi import APIRouter

router = APIRouter()

@router.get("/severity")
def get_severity(score: int):

    if score <= 30:
        level = "Low"
    elif score <= 70:
        level = "Medium"
    else:
        level = "High"

    return {
        "status": "Defective",
        "severity_score": score,
        "severity_level": level,
        "statistics": {
            "total_images_inspected": 5354,
            "good_products": 4700,
            "defective_products": 654,
            "pass_rate": "87.8%",
            "failure_rate": "12.2%"
        }
    }
@router.get("/statistics")
def get_statistics():
    return {
        "total_images_inspected": 5354,
        "good_products": 4700,
        "defective_products": 654,
        "pass_rate": "87.8%",
        "failure_rate": "12.2%"
    }