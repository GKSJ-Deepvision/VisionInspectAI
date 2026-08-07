from fastapi import APIRouter, UploadFile, File, Form
from PIL import Image
import io

from anomaly_detection.inference import predict_defect
from backend.report import generate_report

router = APIRouter()


@router.post("/inspect")
async def inspect_image(
    file: UploadFile = File(...),
    category: str = Form("bottle"),
    enable_yolo: bool = Form(True),
):
    contents = await file.read()

    image = Image.open(io.BytesIO(contents)).convert("RGB")

    prediction_result = predict_defect(
        image,
        category=category,
        enable_yolo=enable_yolo,
    )
    print(prediction_result.keys())
    prediction_result.pop("original_image", None)

    report = generate_report(prediction_result)

    return {
        "inspection_result": prediction_result,
        "inspection_report": report,
    }