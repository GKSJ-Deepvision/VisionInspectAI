from sqlalchemy.orm import Session
from backend.models.database import SessionLocal
from backend.models.user_activity import UserActivity


def save_user_activity(
    username,
    activity
):
    db: Session = SessionLocal()

    try:
        user_activity = UserActivity(
            username=username,
            activity=activity
        )

        db.add(user_activity)
        db.commit()
        db.refresh(user_activity)

        return user_activity.id

    finally:
        db.close()