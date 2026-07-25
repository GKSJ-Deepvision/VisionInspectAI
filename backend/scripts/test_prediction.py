from pathlib import Path

from app.services.prediction_service import predict_image

BASE_DIR = Path(__file__).resolve().parent.parent

IMAGE = BASE_DIR / "training_dataset" / "val" / "good"

image = list(IMAGE.glob("*.png"))[0]

result = predict_image(image)

print(result)