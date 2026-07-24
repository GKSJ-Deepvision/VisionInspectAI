import os
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from flask import Blueprint, current_app, jsonify, request

auth_bp = Blueprint("auth", __name__)


def get_db_connection():
    db_path = current_app.config.get("DATABASE_PATH") or os.environ.get("DATABASE_PATH") or os.path.join(Path(__file__).resolve().parents[1], "..", "instance", "backend.db")
    from app import init_db

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def create_access_token(user_id: int, username: str) -> str:
    secret_key = current_app.config.get("SECRET_KEY") or os.environ.get("SECRET_KEY", "visioninspect_dev_secret_key_2026")
    payload = {
        "sub": str(user_id),
        "username": username,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=24)).timestamp()),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


def get_token_from_header():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


def get_current_user():
    token = get_token_from_header()
    if not token:
        return None

    secret_key = current_app.config.get("SECRET_KEY") or os.environ.get("SECRET_KEY", "visioninspect_dev_secret_key_2026")
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, username, email FROM users WHERE id = ?",
            (int(payload.get("sub")),),
        ).fetchone()
    finally:
        conn.close()

    return user


@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip()
    password = (payload.get("password") or "").strip()

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (username, email, password),
        )
        conn.commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"error": "user already exists"}), 409
    finally:
        conn.close()

    token = create_access_token(user_id, username)
    return jsonify({
        "message": "registered",
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user_id, "username": username, "email": email},
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = (payload.get("password") or "").strip()

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, username, email FROM users WHERE username = ? AND password = ?",
            (username, password),
        ).fetchone()
    finally:
        conn.close()

    if not user:
        return jsonify({"error": "invalid credentials"}), 401
    token = create_access_token(user["id"], user["username"])
    return jsonify({
        "message": "logged in",
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "username": user["username"], "email": user["email"]},
    }), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "unauthorized"}), 401

    return jsonify({"user": {"id": user["id"], "username": user["username"], "email": user["email"]}}), 200
