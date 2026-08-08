from flask import jsonify


def success_response(data=None, message="success", status=200):
    payload = {"success": True}
    if message is not None:
        payload["message"] = message
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status


def error_response(message, status=400):
    return jsonify({"success": False, "error": message}), status
