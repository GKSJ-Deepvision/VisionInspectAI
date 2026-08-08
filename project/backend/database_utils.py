import os
import sqlite3
from pathlib import Path

from flask import current_app


def get_db_path():
    try:
        db_path = current_app.config.get("DATABASE_PATH")
    except RuntimeError:
        db_path = None

    if not db_path:
        db_path = os.environ.get("DATABASE_PATH") or os.path.join(
            Path(__file__).resolve().parent,
            "instance",
            "backend.db",
        )

    return os.path.abspath(db_path)


def init_db(path):
    db_path = os.path.abspath(path)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")

    try:
        cur = conn.cursor()

        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        existing_users = cur.fetchone()

        if existing_users is None:
            cur.execute(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT,
                    role TEXT NOT NULL DEFAULT 'quality_inspector',
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    username TEXT,
                    password TEXT
                )
                """
            )
        else:
            cur.execute("PRAGMA table_info(users)")
            user_info = cur.fetchall()
            user_columns = {row[1]: row for row in user_info}
            needs_user_rebuild = False
            for column_name in ("name", "password_hash"):
                row = user_columns.get(column_name)
                if row and row[3] == 1:
                    needs_user_rebuild = True
                    break

            if needs_user_rebuild:
                cur.execute("ALTER TABLE users RENAME TO users_legacy")
                cur.execute(
                    """
                    CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        email TEXT NOT NULL UNIQUE,
                        password_hash TEXT,
                        role TEXT NOT NULL DEFAULT 'quality_inspector',
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        username TEXT,
                        password TEXT
                    )
                    """
                )
                cur.execute(
                    """
                    INSERT INTO users (id, name, email, password_hash, role, created_at, username, password)
                    SELECT id,
                           CASE WHEN 'name' IN (SELECT name FROM pragma_table_info('users_legacy')) THEN name ELSE NULL END,
                           email,
                           CASE WHEN 'password_hash' IN (SELECT name FROM pragma_table_info('users_legacy')) THEN password_hash ELSE NULL END,
                           role,
                           created_at,
                           username,
                           password
                    FROM users_legacy
                    """
                )
                cur.execute("DROP TABLE users_legacy")

        cur.execute("PRAGMA table_info(users)")
        columns = {row[1] for row in cur.fetchall()}

        if "name" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN name TEXT")
        if "email" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if "password_hash" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        if "role" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'quality_inspector'")
        if "created_at" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN created_at TEXT")
        if "username" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN username TEXT")
        if "password" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN password TEXT")

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS inspections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                category TEXT NOT NULL DEFAULT 'unknown',
                image_path TEXT NOT NULL,
                processed_path TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS inspection_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_id INTEGER,
                user_id INTEGER NOT NULL,
                category TEXT NOT NULL DEFAULT 'unknown',
                result_summary TEXT,
                anomaly_score REAL,
                is_defective INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                filename TEXT,
                status TEXT,
                defect TEXT,
                confidence REAL,
                severity_score REAL,
                severity_level TEXT,
                quality_decision TEXT,
                recommended_action TEXT,
                heatmap_url TEXT,
                inspection_status TEXT,
                inspection_passed INTEGER,
                FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )

        cur.execute("PRAGMA table_info(inspection_results)")
        inspection_columns = {row[1] for row in cur.fetchall()}
        for column_name, column_def in {
            "inspection_id": "INTEGER",
            "user_id": "INTEGER",
            "category": "TEXT",
            "result_summary": "TEXT",
            "anomaly_score": "REAL",
            "is_defective": "INTEGER",
            "created_at": "TEXT",
            "filename": "TEXT",
            "status": "TEXT",
            "defect": "TEXT",
            "confidence": "REAL",
            "severity_score": "REAL",
            "severity_level": "TEXT",
            "quality_decision": "TEXT",
            "recommended_action": "TEXT",
            "heatmap_url": "TEXT",
            "inspection_status": "TEXT",
            "inspection_passed": "INTEGER",
        }.items():
            if column_name not in inspection_columns:
                cur.execute(f"ALTER TABLE inspection_results ADD COLUMN {column_name} {column_def}")

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS defects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_id INTEGER NOT NULL,
                defect_type TEXT NOT NULL,
                size_score REAL NOT NULL DEFAULT 0,
                location_score REAL NOT NULL DEFAULT 0,
                type_score REAL NOT NULL DEFAULT 0,
                confidence_score REAL NOT NULL DEFAULT 0,
                severity_score REAL NOT NULL DEFAULT 0,
                severity_level TEXT,
                heatmap_path TEXT,
                detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS quality_decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_id INTEGER NOT NULL UNIQUE,
                decision TEXT NOT NULL,
                recommended_action TEXT,
                decided_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_date TEXT NOT NULL DEFAULT CURRENT_DATE,
                total_inspections INTEGER NOT NULL DEFAULT 0,
                total_defects INTEGER NOT NULL DEFAULT 0,
                pass_count INTEGER NOT NULL DEFAULT 0,
                fail_count INTEGER NOT NULL DEFAULT 0,
                rework_count INTEGER NOT NULL DEFAULT 0,
                generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_inspection_results_user_created ON inspection_results (user_id, created_at DESC)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_inspection_results_status ON inspection_results (status)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_inspection_results_category ON inspection_results (category)")

        conn.commit()
    except sqlite3.OperationalError as exc:
        conn.rollback()
        if "already exists" not in str(exc):
            raise
        conn.commit()
    finally:
        conn.close()


def get_db_connection():
    db_path = get_db_path()

    init_db(db_path)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn
