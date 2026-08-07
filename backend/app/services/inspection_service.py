from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.inspection import Inspection


def get_dashboard_stats(db: Session):

    total = db.query(Inspection).count()

    good = (
        db.query(Inspection)
        .filter(Inspection.prediction == "GOOD")
        .count()
    )

    defect = (
        db.query(Inspection)
        .filter(Inspection.prediction == "DEFECT")
        .count()
    )

    critical = (
        db.query(Inspection)
        .filter(Inspection.severity == "CRITICAL")
        .count()
    )

    quality = 0

    if total > 0:
        quality = round((good / total) * 100, 2)

    return {
        "total_inspections": total,
        "good_products": good,
        "defective_products": defect,
        "critical_defects": critical,
        "quality_percentage": quality
    }