from sqlalchemy.orm import Session

from backend.models.database import SessionLocal
from backend.models.inspection_history import InspectionHistory
from backend.models.analytics_storage import AnalyticsStorage
from backend.models.report_storage import ReportStorage
from backend.models.batch_inspection import BatchInspection


def save_inspection(
    username,
    image_name,
    defect,
    result
):
    db: Session = SessionLocal()

    try:
        inspection = InspectionHistory(
            username=username,
            image_name=image_name,
            defect=defect,
            result=result
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
    normal_count
):
    db: Session = SessionLocal()

    try:
        analytics = AnalyticsStorage(
            username=username,
            total_images=total_images,
            defect_count=defect_count,
            normal_count=normal_count
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
    report_path
):
    db: Session = SessionLocal()

    try:
        report = ReportStorage(
            username=username,
            report_name=report_name,
            report_path=report_path
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
    status
):
    db: Session = SessionLocal()

    try:
        batch = BatchInspection(
            username=username,
            batch_name=batch_name,
            total_images=total_images,
            status=status
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