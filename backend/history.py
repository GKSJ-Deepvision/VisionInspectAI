from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from bson import ObjectId

from database import history_collection

import csv
import os


router = APIRouter()


# =========================================================
# HELPER - CHECK SUPERVISOR
# =========================================================

def is_supervisor(role: str):

    role = (
        role or ""
    ).strip().lower()

    return role in [
        "supervisor",
        "factory supervisor"
    ]


# =========================================================
# HELPER - ACCESS QUERY
# =========================================================

def build_access_query(
    username: str,
    role: str
):

    username = (
        username or ""
    ).strip()

    # Supervisor sees ALL
    if is_supervisor(role):

        return {}

    # QE sees ONLY own records
    return {
        "username": username
    }


# =========================================================
# GET HISTORY
# =========================================================

@router.get("/history")
def get_history(

    search: str = Query(
        default=""
    ),

    defect: str = Query(
        default="All"
    ),

    username: str = Query(
        default=""
    ),

    role: str = Query(
        default=""
    )
):

    # =====================================================
    # VALIDATION
    # =====================================================

    if not username or not role:

        return {
            "success": False,
            "message":
                "User session not found."
        }


    # =====================================================
    # ACCESS
    # =====================================================

    query = build_access_query(
        username,
        role
    )


    # =====================================================
    # SEARCH
    # =====================================================

    if search:

        query["filename"] = {
            "$regex": search,
            "$options": "i"
        }


    # =====================================================
    # DEFECT FILTER
    # =====================================================

    if defect == "Defective":

        query["defect"] = {
            "$ne": "No Defect"
        }

    elif defect == "No Defect":

        query["defect"] = "No Defect"


    # =====================================================
    # FETCH
    # =====================================================

    history = []

    for item in history_collection.find(
        query
    ).sort(
        "_id",
        -1
    ):

        item["_id"] = str(
            item["_id"]
        )

        history.append(
            item
        )


    return history


# =========================================================
# SAVE HISTORY
# =========================================================

@router.post("/history")
def add_history(
    data: dict
):

    history_collection.insert_one(
        data
    )

    return {
        "success": True,
        "message":
            "Saved Successfully"
    }


# =========================================================
# DELETE HISTORY
# =========================================================

@router.delete("/history/{id}")
def delete_history(

    id: str,

    username: str = Query(
        default=""
    ),

    role: str = Query(
        default=""
    )
):

    # =====================================================
    # VALIDATION
    # =====================================================

    if not username or not role:

        return {
            "success": False,
            "message":
                "User session not found."
        }


    # =====================================================
    # OBJECT ID
    # =====================================================

    try:

        object_id = ObjectId(id)

    except Exception:

        return {
            "success": False,
            "message":
                "Invalid history ID."
        }


    # =====================================================
    # SUPERVISOR
    # =====================================================

    if is_supervisor(role):

        result = history_collection.delete_one({

            "_id": object_id

        })


    # =====================================================
    # QE
    # =====================================================

    else:

        result = history_collection.delete_one({

            "_id": object_id,

            "username": username

        })


    # =====================================================
    # RESULT
    # =====================================================

    if result.deleted_count == 0:

        return {
            "success": False,
            "message":
                "Inspection not found or access denied."
        }


    return {
        "success": True,
        "message":
            "Deleted Successfully"
    }


# =========================================================
# EXPORT CSV
# =========================================================

@router.get("/history/export")
def export_history(

    username: str = Query(
        default=""
    ),

    role: str = Query(
        default=""
    )
):

    # =====================================================
    # VALIDATION
    # =====================================================

    if not username or not role:

        return {
            "success": False,
            "message":
                "User session not found."
        }


    # =====================================================
    # ACCESS QUERY
    # =====================================================

    query = build_access_query(
        username,
        role
    )


    # =====================================================
    # FETCH
    # =====================================================

    history = list(
        history_collection.find(
            query
        )
    )

    # newest first
    history.reverse()


    # =====================================================
    # FILE NAME
    # =====================================================

    if is_supervisor(role):

        filename = (
            "inspection_history_all.csv"
        )

    else:

        filename = (
            f"inspection_history_{username}.csv"
        )


    # =====================================================
    # WRITE CSV
    # =====================================================

    with open(
        filename,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(
            file
        )


        writer.writerow([

            "Filename",

            "Status",

            "Width",

            "Height",

            "Channels",

            "Processed Size",

            "Defect",

            "Category",

            "Severity",

            "Risk",

            "Confidence",

            "Date"

        ])


        for item in history:

            writer.writerow([

                item.get(
                    "filename",
                    ""
                ),

                item.get(
                    "status",
                    ""
                ),

                item.get(
                    "width",
                    ""
                ),

                item.get(
                    "height",
                    ""
                ),

                item.get(
                    "channels",
                    ""
                ),

                item.get(
                    "processed_size",
                    ""
                ),

                item.get(
                    "defect",
                    ""
                ),

                item.get(
                    "category",
                    ""
                ),

                item.get(
                    "severity",
                    ""
                ),

                item.get(
                    "risk",
                    ""
                ),

                item.get(
                    "confidence",
                    ""
                ),

                item.get(
                    "date",
                    ""
                )

            ])


    # =====================================================
    # RETURN
    # =====================================================

    return FileResponse(

        path=filename,

        filename=filename,

        media_type="text/csv"

    )