from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from bson import ObjectId
from database import history_collection
import csv

router = APIRouter()


# ------------------ GET HISTORY ------------------ #

@router.get("/history")
def get_history(
    search: str = Query(default=""),
    defect: str = Query(default="All")
):

    query = {}

    # Search by filename
    if search:
        query["filename"] = {
            "$regex": search,
            "$options": "i"
        }

    # Filter
    if defect == "Defective":
        query["defect"] = {
            "$ne": "No Defect"
        }

    elif defect == "No Defect":
        query["defect"] = "No Defect"

    history = []

    for item in history_collection.find(query):
        item["_id"] = str(item["_id"])
        history.append(item)

    return history


# ------------------ SAVE HISTORY ------------------ #

@router.post("/history")
def add_history(data: dict):

    history_collection.insert_one(data)

    return {
        "success": True,
        "message": "Saved Successfully"
    }


# ------------------ DELETE HISTORY ------------------ #

@router.delete("/history/{id}")
def delete_history(id: str):

    result = history_collection.delete_one(
        {"_id": ObjectId(id)}
    )

    if result.deleted_count == 0:
        return {
            "success": False,
            "message": "History not found"
        }

    return {
        "success": True,
        "message": "Deleted Successfully"
    }


# ------------------ EXPORT CSV ------------------ #

@router.get("/history/export")
def export_history():

    filename = "inspection_history.csv"

    history = list(
        history_collection.find({}, {"_id": 0})
    )

    with open(filename, "w", newline="") as file:

        writer = csv.writer(file)

        writer.writerow([
            "Filename",
            "Status",
            "Width",
            "Height",
            "Channels",
            "Processed Size",
            "Defect",
            "Confidence",
            "Date"
        ])

        for item in history:

            writer.writerow([
                item.get("filename", ""),
                item.get("status", ""),
                item.get("width", ""),
                item.get("height", ""),
                item.get("channels", ""),
                item.get("processed_size", ""),
                item.get("defect", ""),
                item.get("confidence", ""),
                item.get("date", "")
            ])

    return FileResponse(
        path=filename,
        filename=filename,
        media_type="text/csv"
    )