from ultralytics import YOLO
import cv2
import os

from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# MODEL PATH
# =========================================================

DEFAULT_MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../object_detection/runs/detect/train-2/weights/best.pt"
    )
)

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    DEFAULT_MODEL_PATH
)


# =========================================================
# LOAD YOLO MODEL
# =========================================================

print("======================================")
print("Loading YOLO Model")
print("Model Path:", MODEL_PATH)
print("======================================")

model = YOLO(MODEL_PATH)

print("YOLO Model Loaded Successfully")
print("Classes:", model.names)


# =========================================================
# PREDICT OBJECTS + CATEGORY
# =========================================================

def predict_objects(image_path):

    print("======================================")
    print("YOLO DETECTION STARTED")
    print("Image:", image_path)
    print("======================================")

    try:

        # =================================================
        # NORMAL DEFECT DETECTION
        # =================================================

        results = model.predict(
            source=image_path,
            conf=0.30,
            save=False,
            verbose=False
        )

        detections = []

        # =================================================
        # EXTRACT DETECTIONS
        # =================================================

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                cls_id = int(
                    box.cls[0].item()
                )

                confidence = float(
                    box.conf[0].item()
                )

                xyxy = box.xyxy[0].tolist()

                x1 = int(xyxy[0])
                y1 = int(xyxy[1])
                x2 = int(xyxy[2])
                y2 = int(xyxy[3])

                class_name = model.names.get(
                    cls_id,
                    str(cls_id)
                )

                detections.append({
                    "class": str(class_name),

                    "confidence": round(
                        confidence * 100,
                        2
                    ),

                    "bbox": [
                        x1,
                        y1,
                        x2,
                        y2
                    ]
                })

        # =================================================
        # CATEGORY
        # =================================================

        category = None

        if len(detections) > 0:

            best_detection = max(
                detections,
                key=lambda x: x["confidence"]
            )

            category = best_detection["class"]

        else:

            # =================================================
            # NO DEFECT CASE
            #
            # Try a very low confidence pass only to identify
            # the trained product/category.
            #
            # This does NOT become a defect detection.
            # =================================================

            print(
                "No detection at normal confidence."
            )

            category_results = model.predict(
                source=image_path,
                conf=0.01,
                save=False,
                verbose=False
            )

            category_candidates = []

            for result in category_results:

                if result.boxes is None:
                    continue

                for box in result.boxes:

                    cls_id = int(
                        box.cls[0].item()
                    )

                    confidence = float(
                        box.conf[0].item()
                    )

                    class_name = model.names.get(
                        cls_id,
                        str(cls_id)
                    )

                    category_candidates.append({
                        "class": str(class_name),
                        "confidence": confidence
                    })

            if len(category_candidates) > 0:

                best_category = max(
                    category_candidates,
                    key=lambda x: x["confidence"]
                )

                category = best_category["class"]

                print(
                    "Category identified:",
                    category
                )

            else:

                category = "Unknown"

                print(
                    "Category could not be identified."
                )

        print(
            "Total detections:",
            len(detections)
        )

        print(
            "Final Category:",
            category
        )

        # =================================================
        # DRAW BOUNDING BOXES
        # =================================================

        if len(detections) > 0:

            image = cv2.imread(
                image_path
            )

            if image is not None:

                image_height, image_width = image.shape[:2]

                # -----------------------------------------
                # COLLECT COORDINATES
                # -----------------------------------------

                all_x1 = []
                all_y1 = []
                all_x2 = []
                all_y2 = []

                for detection in detections:

                    x1, y1, x2, y2 = detection["bbox"]

                    all_x1.append(x1)
                    all_y1.append(y1)
                    all_x2.append(x2)
                    all_y2.append(y2)

                # -----------------------------------------
                # COMBINED BOUNDING BOX
                # -----------------------------------------

                min_x = min(all_x1)
                min_y = min(all_y1)

                max_x = max(all_x2)
                max_y = max(all_y2)

                box_width = max_x - min_x
                box_height = max_y - min_y

                padding_x = max(
                    int(box_width * 0.15),
                    15
                )

                padding_y = max(
                    int(box_height * 0.15),
                    15
                )

                min_x = max(
                    0,
                    min_x - padding_x
                )

                min_y = max(
                    0,
                    min_y - padding_y
                )

                max_x = min(
                    image_width - 1,
                    max_x + padding_x
                )

                max_y = min(
                    image_height - 1,
                    max_y + padding_y
                )

                # -----------------------------------------
                # GREEN BOUNDING BOX
                # -----------------------------------------

                cv2.rectangle(
                    image,
                    (min_x, min_y),
                    (max_x, max_y),
                    (0, 255, 0),
                    3
                )

                # -----------------------------------------
                # LABEL
                # -----------------------------------------

                defect_count = len(
                    detections
                )

                unique_classes = sorted(
                    set(
                        detection["class"]
                        for detection in detections
                    )
                )

                class_text = ", ".join(
                    unique_classes
                )

                label = (
                    f"DEFECTS: {defect_count}"
                    f" | {class_text}"
                )

                font = cv2.FONT_HERSHEY_SIMPLEX

                font_scale = max(
                    0.7,
                    min(
                        image_width / 900,
                        1.0
                    )
                )

                thickness = 2

                (
                    text_width,
                    text_height
                ), baseline = cv2.getTextSize(
                    label,
                    font,
                    font_scale,
                    thickness
                )

                label_padding = 8

                label_x = min_x

                if min_y < text_height + 25:

                    label_y = (
                        min_y
                        + text_height
                        + 15
                    )

                else:

                    label_y = (
                        min_y
                        - 8
                    )

                if (
                    label_y + baseline
                    > image_height
                ):

                    label_y = (
                        image_height
                        - baseline
                        - 5
                    )

                bg_x1 = label_x

                bg_y1 = (
                    label_y
                    - text_height
                    - label_padding
                )

                bg_x2 = (
                    label_x
                    + text_width
                    + label_padding * 2
                )

                bg_y2 = (
                    label_y
                    + baseline
                    + label_padding
                )

                bg_x1 = max(
                    0,
                    bg_x1
                )

                bg_y1 = max(
                    0,
                    bg_y1
                )

                bg_x2 = min(
                    image_width - 1,
                    bg_x2
                )

                bg_y2 = min(
                    image_height - 1,
                    bg_y2
                )

                # -----------------------------------------
                # LABEL BACKGROUND
                # -----------------------------------------

                cv2.rectangle(
                    image,
                    (bg_x1, bg_y1),
                    (bg_x2, bg_y2),
                    (0, 0, 0),
                    -1
                )

                # -----------------------------------------
                # LABEL BORDER
                # -----------------------------------------

                cv2.rectangle(
                    image,
                    (bg_x1, bg_y1),
                    (bg_x2, bg_y2),
                    (0, 255, 0),
                    1
                )

                # -----------------------------------------
                # LABEL TEXT
                # -----------------------------------------

                cv2.putText(
                    image,
                    label,
                    (
                        label_x
                        + label_padding,
                        label_y
                    ),
                    font,
                    font_scale,
                    (0, 255, 0),
                    thickness,
                    cv2.LINE_AA
                )

                # =================================================
                # PROCESSED FOLDER
                # =================================================

                backend_folder = os.path.dirname(
                    os.path.dirname(
                        os.path.abspath(__file__)
                    )
                )

                processed_folder = os.path.abspath(
                    os.path.join(
                        backend_folder,
                        "..",
                        "processed"
                    )
                )

                os.makedirs(
                    processed_folder,
                    exist_ok=True
                )

                # =================================================
                # OUTPUT PATH
                # =================================================

                output_path = os.path.join(
                    processed_folder,
                    os.path.basename(image_path)
                )

                # =================================================
                # SAVE ANNOTATED IMAGE
                # =================================================

                success = cv2.imwrite(
                    output_path,
                    image
                )

                print(
                    "Annotated image saved:",
                    output_path
                )

                print(
                    "Save successful:",
                    success
                )

        else:

            # =================================================
            # NO DEFECT
            #
            # Save original image as processed image.
            # =================================================

            image = cv2.imread(
                image_path
            )

            if image is not None:

                backend_folder = os.path.dirname(
                    os.path.dirname(
                        os.path.abspath(__file__)
                    )
                )

                processed_folder = os.path.abspath(
                    os.path.join(
                        backend_folder,
                        "..",
                        "processed"
                    )
                )

                os.makedirs(
                    processed_folder,
                    exist_ok=True
                )

                output_path = os.path.join(
                    processed_folder,
                    os.path.basename(image_path)
                )

                cv2.imwrite(
                    output_path,
                    image
                )

                print(
                    "No-defect image copied to processed folder:",
                    output_path
                )

        # =================================================
        # FINAL RESULT
        # =================================================

        return {
            "detections": detections,
            "category": category
        }

    except Exception as e:

        print("======================================")
        print("YOLO ERROR")
        print(str(e))
        print("======================================")

        return {
            "detections": [],
            "category": "Unknown"
        }