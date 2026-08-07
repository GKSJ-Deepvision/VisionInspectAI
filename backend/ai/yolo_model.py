from ultralytics import YOLO
import os
import cv2

MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../object_detection/runs/detect/train/weights/best.pt"
    )
)

model = YOLO(MODEL_PATH)


def predict_objects(image_path):

    results = model.predict(
        source=image_path,
        conf=0.15,
        save=False
    )
    image = cv2.imread(image_path)

    detections = []

    for result in results:

        for box in result.boxes:

            cls = int(box.cls[0])
            conf = float(box.conf[0])

            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            label = model.names[cls]

            detections.append({
                "class": label,
                "confidence": round(conf * 100, 2),
                "bbox": [x1, y1, x2, y2]
            })

            # Draw EVERY detection
            cv2.rectangle(
                image,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                image,
                f"{label} {conf*100:.1f}%",
                (x1, max(30, y1 - 10)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

    # Save processed image
    processed_path = image_path.replace("uploads", "processed")
    os.makedirs(os.path.dirname(processed_path), exist_ok=True)
    cv2.imwrite(processed_path, image)

    return detections