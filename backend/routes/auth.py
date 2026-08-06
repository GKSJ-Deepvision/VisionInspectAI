import os
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from ..config import SECRET_KEY
    from ..database_utils import get_db_connection
except ImportError:  # pragma: no cover - pytest imports routes as top-level modules
    from config import SECRET_KEY
    from database_utils import get_db_connection

auth_bp = Blueprint("auth", __name__)


def create_access_token(user_id: int, username: str, role: str) -> str:
    secret_key = current_app.config.get("SECRET_KEY") or SECRET_KEY
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=24)).timestamp()),
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token if isinstance(token, str) else token.decode("utf-8")


def verify_password(stored_password: str, password: str) -> bool:
    if not stored_password or not password:
        return False

    try:
        if check_password_hash(stored_password, password):
            return True
    except (ValueError, TypeError):
        pass

    return stored_password == password


def get_token_from_header():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


def get_current_user():
    token = get_token_from_header()
    if not token:
        return None

    secret_key = current_app.config.get("SECRET_KEY") or SECRET_KEY
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, COALESCE(username, name, email) AS username, email, role, password_hash, password FROM users WHERE id = ?",
            (int(payload.get("sub")),),
        ).fetchone()
    finally:
        conn.close()

    return user

def require_role(*allowed_roles):
    user = get_current_user()

    if not user:
        return None, jsonify({"success": False, "error": "unauthorized"}), 401

    if user["role"] not in allowed_roles:
        return None, jsonify({"success": False, "error": "forbidden"}), 403

    return user, None, None


@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    password = (payload.get("password") or "").strip()
    role = (payload.get("role") or "quality_inspector").strip() or "quality_inspector"

    if role not in {"quality_inspector", "factory_supervisor"}:
        role = "quality_inspector"

    if not username or not email or not password:
        return jsonify({"success": False, "error": "username, email, and password are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()

        password_hash = generate_password_hash(password)

        cur.execute(
            "INSERT INTO users (name, email, password_hash, role, username, password) VALUES (?, ?, ?, ?, ?, ?)",
            (username, email, password_hash, role, username, password_hash),
        )
        
        conn.commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError as exc:
      print("REGISTRATION DATABASE ERROR:", exc)
      return jsonify({"success": False, "error": str(exc)}), 409
    finally:
        conn.close()

    token = create_access_token(user_id, username, role)
    return jsonify({
        "success": True,
        "message": "registered",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": username,
            "email": email,
            "role": role,
        },
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = (payload.get("password") or "").strip()

    if not username or not password:
        return jsonify({"success": False, "error": "username and password are required"}), 400

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, COALESCE(username, name, email) AS username, name, email, password_hash, password, role FROM users WHERE email = ? OR username = ? OR name = ?",
            (username, username, username),
        ).fetchone()
    finally:
        conn.close()

    stored_password = user["password_hash"] or user["password"] if user else None
    if not user or not verify_password(stored_password or "", password):
        return jsonify({"success": False, "error": "invalid credentials"}), 401
    token = create_access_token(
    user["id"],
    user["username"],
    user["role"],
)
    return jsonify({
        "success": True,
        "message": "logged in",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
        },
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"success": True, "message": "logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "error": "unauthorized"}), 401

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
        }
    }), 200
