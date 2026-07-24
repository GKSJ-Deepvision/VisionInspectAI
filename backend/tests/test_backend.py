import os
import sqlite3
import sys
import tempfile
from io import BytesIO
from pathlib import Path

import jwt
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app


@pytest.fixture()
def client():
    db_path = Path(__file__).resolve().parent / "test_backend.db"
    if db_path.exists():
        db_path.unlink()

    app = create_app()
    app.config.update(TESTING=True)
    app.config["DATABASE_PATH"] = str(db_path)
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
    assert payload["user"]["role"] == "quality_engineer"


def test_login_returns_stored_role(client):
    client.post(
        "/api/auth/register",
        json={"username": "supervisor", "email": "supervisor@example.com", "password": "secret123"},
    )

    db_path = client.application.config["DATABASE_PATH"]
    conn = sqlite3.connect(db_path)
    conn.execute("UPDATE users SET role = ? WHERE username = ?", ("factory_supervisor", "supervisor"))
    conn.commit()
    conn.close()

    response = client.post(
        "/api/auth/login",
        json={"username": "supervisor", "password": "secret123"},
    )

    assert response.status_code == 200
    assert response.get_json()["user"]["role"] == "factory_supervisor"


@pytest.mark.parametrize("role", ["quality_inspector", "quality_engineer", "admin"])
def test_login_returns_each_supported_role(client, role):
    username = f"{role}_user"
    client.post(
        "/api/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret123"},
    )

    db_path = client.application.config["DATABASE_PATH"]
    conn = sqlite3.connect(db_path)
    conn.execute("UPDATE users SET role = ? WHERE username = ?", (role, username))
    conn.commit()
    conn.close()

    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": "secret123"},
    )

    assert response.status_code == 200
    assert response.get_json()["user"]["role"] == role


def _register_and_headers(client, username):
    response = client.post(
        "/api/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret123"},
    )
    token = response.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_history_and_analytics_are_user_specific(client):
    first_headers = _register_and_headers(client, "first")
    second_headers = _register_and_headers(client, "second")

    first_create = client.post(
        "/api/inspection",
        json={"filename": "first.jpg", "status": "completed", "score": 0.9, "user_id": 999},
        headers=first_headers,
    )
    second_create = client.post(
        "/api/inspection",
        json={"filename": "second.jpg", "status": "failed", "score": 0.2},
        headers=second_headers,
    )
    first_id = first_create.get_json()["id"]
    second_id = second_create.get_json()["id"]

    first_history = client.get("/api/history", headers=first_headers).get_json()
    second_history = client.get("/api/history", headers=second_headers).get_json()
    assert first_history["total"] == 1
    assert first_history["results"][0]["filename"] == "first.jpg"
    assert second_history["total"] == 1
    assert second_history["results"][0]["filename"] == "second.jpg"

    first_analytics = client.get("/api/analytics", headers=first_headers).get_json()
    assert first_analytics["summary"]["total_inspections"] == 1
    assert first_analytics["summary"]["average_score"] == 0.9

    assert client.get(f"/api/history/{second_id}", headers=first_headers).status_code == 404
    assert client.get(f"/api/inspection/{second_id}", headers=first_headers).status_code == 404
    assert client.put(
        f"/api/inspection/{second_id}",
        json={"status": "completed", "score": 1.0},
        headers=first_headers,
    ).status_code == 404
    assert client.get(f"/api/inspection/{first_id}", headers=first_headers).status_code == 200


def test_image_inspection_persists_authenticated_user(client):
    headers = _register_and_headers(client, "inspector")
    response = client.post(
        "/api/inspection/image",
        data={"file": (BytesIO(b"not-a-real-image"), "sample.jpg")},
        headers=headers,
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    result = response.get_json()
    assert result["user_id"] == 1
    history = client.get("/api/history", headers=headers).get_json()
    assert history["total"] == 1
    assert history["results"][0]["id"] == result["id"]


def test_image_inspection_uses_configured_upload_folder(client):
    headers = _register_and_headers(client, "configured-inspector")
    upload_dir = tempfile.mkdtemp()
    client.application.config["UPLOAD_FOLDER"] = upload_dir

    from PIL import Image

    image = Image.new("RGB", (2, 2), color="white")
    image_bytes = BytesIO()
    image.save(image_bytes, format="PNG")
    image_bytes.seek(0)

    response = client.post(
        "/api/inspection/image",
        data={"file": (image_bytes, "sample.png")},
        headers=headers,
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    assert response.get_json()["status"] == "completed"


def test_malformed_token_is_unauthorized(client):
    token = jwt.encode(
        {"sub": "not-an-integer"},
        client.application.config["SECRET_KEY"],
        algorithm="HS256",
    )
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_upload_requires_authentication_and_sanitizes_filename(client):
    file_data = {"file": (BytesIO(b"file"), "../../unsafe.txt")}
    assert client.post("/api/upload", data=file_data, content_type="multipart/form-data").status_code == 401

    headers = _register_and_headers(client, "uploader")
    response = client.post(
        "/api/upload",
        data={"file": (BytesIO(b"file"), "../../unsafe.txt")},
        headers=headers,
        content_type="multipart/form-data",
    )
    assert response.status_code == 201
    assert response.get_json()["filename"] == "unsafe.txt"


def test_role_based_api_access(client):
    role_headers = {}
    for role in ["quality_inspector", "quality_engineer", "admin"]:
        role_headers[role] = _register_and_headers(client, role)
        db_path = client.application.config["DATABASE_PATH"]
        conn = sqlite3.connect(db_path)
        conn.execute("UPDATE users SET role = ? WHERE username = ?", (role, role))
        conn.commit()
        conn.close()
        login_response = client.post(
            "/api/auth/login",
            json={"username": role, "password": "secret123"},
        )
        role_headers[role] = {"Authorization": f"Bearer {login_response.get_json()['access_token']}"}

    assert client.get("/api/analytics", headers=role_headers["quality_inspector"]).status_code == 403
    assert client.get("/api/dataset", headers=role_headers["quality_inspector"]).status_code == 403
    assert client.put("/api/inspection/999", json={}, headers=role_headers["quality_inspector"]).status_code == 403

    assert client.get("/api/analytics", headers=role_headers["quality_engineer"]).status_code == 200
    assert client.get("/api/dataset", headers=role_headers["quality_engineer"]).status_code == 200
    assert client.get("/api/analytics", headers=role_headers["admin"]).status_code == 200
    assert client.get("/api/dataset", headers=role_headers["admin"]).status_code == 200
