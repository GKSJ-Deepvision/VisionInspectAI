from sqlalchemy.orm import Session

from backend.models.database import SessionLocal
from backend.models.inspection_history import InspectionHistory
from backend.models.analytics_storage import AnalyticsStorage
from backend.models.report_storage import ReportStorage
from backend.models.batch_inspection import BatchInspection


def save_inspection(
    username,
    image_name,
    category,
    defect,
    result,
    confidence,
    anomaly_score,
    severity_score,
    severity_level,
    threshold=None,
    recommended_action=None,
    class_probabilities=None,
    severity_breakdown=None,
    quality_report=None,
    processing_time_ms=None,
):
    db: Session = SessionLocal()

    try:
        inspection = InspectionHistory(
            username=username,
            image_name=image_name,
            category=category,
            defect=defect,
            result=result,
            confidence=confidence,
            anomaly_score=anomaly_score,
            severity_score=severity_score,
            severity_level=severity_level,
            threshold=threshold,
            recommended_action=recommended_action,
            class_probabilities=class_probabilities,
            severity_breakdown=severity_breakdown,
            quality_report=quality_report,
            processing_time_ms=processing_time_ms,
        )

        db.add(inspection)
        db.commit()
        db.refresh(inspection)

        return inspection.id

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def save_analytics(
    username,
    total_images,
    defect_count,
    normal_count,
):
    db: Session = SessionLocal()

    try:
        analytics = AnalyticsStorage(
            username=username,
            total_images=total_images,
            defect_count=defect_count,
            normal_count=normal_count,
        )

        db.add(analytics)
        db.commit()
        db.refresh(analytics)

        return analytics.id

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def save_report(
    username,
    report_name,
    report_path,
):
    db: Session = SessionLocal()

    try:
        report = ReportStorage(
            username=username,
            report_name=report_name,
            report_path=report_path,
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return report.id

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def save_batch_inspection(
    username,
    batch_name,
    total_images,
    status,
):
    db: Session = SessionLocal()

    try:
        batch = BatchInspection(
            username=username,
            batch_name=batch_name,
            total_images=total_images,
            status=status,
        )

        db.add(batch)
        db.commit()
        db.refresh(batch)

        return batch.id

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()