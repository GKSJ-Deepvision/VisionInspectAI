import io
import os
import sys
import uuid
from pathlib import Path

import pytest
from PIL import Image
from werkzeug.security import generate_password_hash

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app


@pytest.fixture()
def client():
    db_dir = Path(__file__).resolve().parent / "tmp_test_dbs"
    db_dir.mkdir(exist_ok=True)
    db_path = db_dir / f"test_backend_{uuid.uuid4().hex}.db"
    if db_path.exists():
        db_path.unlink()

    app = create_app(test_config={"TESTING": True, "DATABASE_PATH": str(db_path)})
    with app.test_client() as client:
        yield client


def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_register_and_login(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "demo", "email": "demo@example.com", "password": "secret123"},
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={"username": "demo", "password": "secret123"},
    )
    assert login_response.status_code == 200
    payload = login_response.get_json()
    assert payload["user"]["username"] == "demo"


def test_history_endpoint_returns_standardized_results(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "history", "email": "history@example.com", "password": "secret123"},
    )
    assert register_response.status_code == 201

    token = register_response.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/api/inspection",
        json={"filename": "sample.jpg", "status": "Defective", "score": 86.2},
        headers=headers,
    )
    assert create_response.status_code == 201

    history_response = client.get("/api/history", headers=headers)
    assert history_response.status_code == 200

    payload = history_response.get_json()
    assert payload["success"] is True
    assert payload["data"]["total"] >= 1
    assert payload["data"]["results"][0]["filename"] == "sample.jpg"


def test_new_users_default_to_quality_inspector_role(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "inspector1", "email": "inspector1@example.com", "password": "secret123"},
    )

    assert response.status_code == 201
    assert response.get_json()["user"]["role"] == "quality_inspector"


def test_inspector_can_access_their_own_analytics(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "analyst", "email": "analyst@example.com", "password": "secret123"},
    )
    assert register_response.status_code == 201

    token = register_response.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/api/inspection",
        json={"filename": "inspector.jpg", "status": "Defective", "score": 42.5},
        headers=headers,
    )
    assert create_response.status_code == 201

    analytics_response = client.get("/api/analytics", headers=headers)
    assert analytics_response.status_code == 200
    payload = analytics_response.get_json()
    assert payload["success"] is True
    assert payload["data"]["summary"]["total_inspections"] >= 1


def test_supervisor_can_access_all_history_and_analytics(client):
    db_path = Path(client.application.config["DATABASE_PATH"])
    import sqlite3

    conn = sqlite3.connect(db_path)
    conn.execute(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ("supervisor", "supervisor@example.com", "pbkdf2:sha256$dummy", "factory_supervisor"),
    )
    conn.commit()
    conn.close()

    login_response = client.post(
        "/api/auth/login",
        json={"username": "supervisor", "password": "secret123"},
    )
    assert login_response.status_code == 401

    conn = sqlite3.connect(db_path)
    conn.execute(
        "UPDATE users SET password = ? WHERE username = ?",
        (generate_password_hash("secret123"), "supervisor"),
    )
    conn.commit()
    conn.close()

    login_response = client.post(
        "/api/auth/login",
        json={"username": "supervisor", "password": "secret123"},
    )
    assert login_response.status_code == 200

    token = login_response.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    history_response = client.get("/api/history", headers=headers)
    assert history_response.status_code == 200

    analytics_response = client.get("/api/analytics", headers=headers)
    assert analytics_response.status_code == 200


def test_supervisor_can_export_reports(client):
    db_path = Path(client.application.config["DATABASE_PATH"])
    import sqlite3

    conn = sqlite3.connect(db_path)
    conn.execute(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ("supervisor", "supervisor@example.com", "pbkdf2:sha256$dummy", "factory_supervisor"),
    )
    conn.commit()
    conn.close()

    login_response = client.post(
        "/api/auth/login",
        json={"username": "supervisor", "password": "secret123"},
    )
    assert login_response.status_code == 401

    conn = sqlite3.connect(db_path)
    conn.execute(
        "UPDATE users SET password = ? WHERE username = ?",
        (generate_password_hash("secret123"), "supervisor"),
    )
    conn.commit()
    conn.close()

    login_response = client.post(
        "/api/auth/login",
        json={"username": "supervisor", "password": "secret123"},
    )
    assert login_response.status_code == 200

    token = login_response.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    json_response = client.get("/api/reports/export", headers=headers)
    assert json_response.status_code == 200
    payload = json_response.get_json()
    assert payload["success"] is True
    assert "records" in payload["data"]

    csv_response = client.get("/api/reports/export?format=csv", headers=headers)
    assert csv_response.status_code == 200
    assert csv_response.content_type.startswith("text/csv")
    assert "attachment; filename=inspection_reports.csv" in csv_response.headers.get("Content-Disposition", "")


def test_inspection_endpoint_accepts_multipart_ai_payload(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "aiuser", "email": "aiuser@example.com", "password": "secret123"},
    )
    token = register_response.get_json()["access_token"]

    image_bytes = b"\x89PNG\r\n\x1a\n" + b"0" * 32
    response = client.post(
        "/api/inspection",
        data={
            "file": (io.BytesIO(image_bytes), "sample.png"),
            "category": "metal",
            "status": "pending",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["data"]["filename"].endswith(".png")


def test_inspection_predict_accepts_formdata_image_and_category(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "predictuser", "email": "predictuser@example.com", "password": "secret123"},
    )
    token = register_response.get_json()["access_token"]

    image = Image.new("RGB", (64, 64), color=(255, 0, 0))
    image_bytes = io.BytesIO()
    image.save(image_bytes, format="PNG")
    image_bytes.seek(0)

    response = client.post(
        "/api/inspection/predict",
        data={
            "image": (image_bytes, "predict.png"),
            "category": "metal",
        },
        headers={"Authorization": f"Bearer {token}"},
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["data"]["category"] == "metal"
    assert payload["data"]["heatmap_url"] is not None
    assert payload["data"]["inspection_id"] is not None
    assert payload["data"]["inspection_result_id"] is not None
