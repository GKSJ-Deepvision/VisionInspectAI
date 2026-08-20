import sqlite3
from werkzeug.security import generate_password_hash

from database_utils import get_db_path

DATABASE_PATH = get_db_path()

username = "supervisor"
email = "supervisor@visioninspect.ai"
password = "Supervisor@2026"
role = "factory_supervisor"

conn = sqlite3.connect(DATABASE_PATH)

try:
    cursor = conn.cursor()

    password_hash = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
        """,
        (username, email, password_hash, role),
    )

    conn.commit()

    print("Supervisor account created successfully!")
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Role: {role}")

except sqlite3.IntegrityError as e:
    print("Could not create supervisor account.")
    print("Database error:", e)

finally:
    conn.close()