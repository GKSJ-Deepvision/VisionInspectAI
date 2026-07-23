import os
import sqlite3
from pathlib import Path

from app import init_db


DEMO_USERS = (
    ("inspector.demo", "inspector.demo@visioninspect.local", "VisionInspect123!", "quality_inspector"),
    ("engineer.demo", "engineer.demo@visioninspect.local", "VisionInspect123!", "quality_engineer"),
    ("admin.demo", "admin.demo@visioninspect.local", "VisionInspect123!", "admin"),
)


def main():
    database_path = os.environ.get(
        "DATABASE_PATH",
        str(Path(__file__).resolve().parents[1] / "instance" / "backend.db"),
    )
    database_path = os.path.abspath(database_path)
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    init_db(database_path)

    conn = sqlite3.connect(database_path)
    try:
        for username, email, password, role in DEMO_USERS:
            conn.execute(
                """
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(username) DO UPDATE SET
                    email = excluded.email,
                    password = excluded.password,
                    role = excluded.role
                """,
                (username, email, password, role),
            )
        conn.commit()
    finally:
        conn.close()

    print(f"Seeded {len(DEMO_USERS)} demo users in {database_path}")
    for username, _, _, role in DEMO_USERS:
        print(f"{username}: {role}")


if __name__ == "__main__":
    main()