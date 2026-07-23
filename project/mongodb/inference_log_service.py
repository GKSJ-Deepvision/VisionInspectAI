from datetime import datetime
from database.mongo_connection import get_mongo_db
 
COLLECTION = "inference_results"
 
def save_inference_result(inspection_id, model_version, anomaly_score,
                           prediction, heatmap_path, mask_path,
                           defects_detected, processing_time_ms):
    db = get_mongo_db()
    document = {
        "inspection_id": inspection_id,
        "model_version": model_version,
        "timestamp": datetime.utcnow(),
        "anomaly_score": anomaly_score,
        "prediction": prediction,
        "heatmap_path": heatmap_path,
        "mask_path": mask_path,
        "defects_detected": defects_detected,
        "processing_time_ms": processing_time_ms,
    }
    result = db[COLLECTION].insert_one(document)
    return str(result.inserted_id)
 
def get_inference_result(inspection_id):
    db = get_mongo_db()
    doc = db[COLLECTION].find_one({"inspection_id": inspection_id})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc
