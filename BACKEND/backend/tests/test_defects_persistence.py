import io
import sqlite3
from pathlib import Path

from PIL import Image
import pytest
from unittest.mock import patch

from app import create_app


@pytest.fixture()
def client(tmp_path):
    db_path = tmp_path / "test_defects.db"
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    app = create_app(test_config={
        "TESTING": True,
        "DATABASE_PATH": str(db_path),
        "UPLOAD_FOLDER": str(upload_dir),
    })
    with app.test_client() as client:
        yield client


def make_image_bytes():
    img = Image.new("RGB", (32, 32), color=(123, 222, 111))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def test_predict_persists_defects_and_quality_decision(client, tmp_path):
    # Register user
    reg = client.post("/api/auth/register", json={"username": "defuser", "email": "defuser@example.com", "password": "secret123"})
    assert reg.status_code == 201
    token = reg.get_json()["access_token"]

    # Prepare fake inference result with two defects and a decision
    fake_result = {
        "image_name": "def.png",
        "category": "metal",
        "status": "Defective",
        "anomaly_score": 0.92,
        "heatmap_url": "/outputs/heatmaps/fake.png",
        "defects": [
            {
                "defect_type": "crack",
                "size_score": 12.5,
                "location_score": 40.0,
                "type_score": 90.0,
                "confidence_score": 0.87,
                "severity_score": 78.3,
                "severity_level": "High",
                "heatmap_path": "/outputs/heatmaps/def1.png",
            },
            {
                "defect_type": "scratch",
                "size_score": 2.0,
                "location_score": 10.0,
                "type_score": 60.0,
                "confidence_score": 0.65,
                "severity_score": 45.0,
                "severity_level": "Medium",
                "heatmap_path": "/outputs/heatmaps/def2.png",
            },
        ],
        "quality_decision": "Reject",
        "recommended_action": "Reject Product",
        "inspection_status": "Completed",
        "inspection_passed": False,
    }

    # Patch the run_inference used by the inspection route (routes.inspection.run_inference)
    with patch("routes.inspection.run_inference", return_value=fake_result):
        img_buf = make_image_bytes()
        resp = client.post(
            "/api/inspection/predict",
            data={"image": (img_buf, "def.png"), "category": "metal"},
            headers={"Authorization": f"Bearer {token}"},
            content_type="multipart/form-data",
        )

    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload["success"] is True

    # Verify DB entries
    db_path = client.application.config["DATABASE_PATH"]
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Check inspections
    cur.execute("SELECT id FROM inspections ORDER BY id DESC LIMIT 1")
    inspection_row = cur.fetchone()
    assert inspection_row is not None
    inspection_id = inspection_row[0]

    # Check inspection_results
    cur.execute("SELECT id FROM inspection_results WHERE inspection_id = ?", (inspection_id,))
    res = cur.fetchone()
    assert res is not None

    # Check defects table has two entries for this inspection
    cur.execute("SELECT defect_type, severity_level FROM defects WHERE inspection_id = ? ORDER BY id", (inspection_id,))
    defects = cur.fetchall()
    assert len(defects) == 2
    assert defects[0][0] == "crack"
    assert defects[1][0] == "scratch"

    # Check quality_decisions
    cur.execute("SELECT decision, recommended_action FROM quality_decisions WHERE inspection_id = ?", (inspection_id,))
    q = cur.fetchone()
    assert q is not None
    assert q[0] == "Reject"
    assert q[1] == "Reject Product"

    conn.close()
