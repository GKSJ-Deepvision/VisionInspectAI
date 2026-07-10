import os
import sys
from pathlib import Path

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
