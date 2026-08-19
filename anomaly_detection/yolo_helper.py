import logging
from PIL import Image
import numpy as np

# Set up logging
logger = logging.getLogger("anomaly_detection.yolo_helper")

_yolo_model = None


def get_yolo_model():
    """Lazy loads and caches the YOLOv8 model."""
    global _yolo_model

    if _yolo_model is None:
        try:
            from ultralytics import YOLO

            logger.info("Loading pre-trained YOLOv8n model...")
            _yolo_model = YOLO("yolov8n.pt")
            logger.info("YOLOv8n model loaded successfully.")

        except Exception as e:
            logger.error(
                f"Failed to load YOLOv8: {e}. "
                "Using fallback crop mode."
            )
            _yolo_model = None

    return _yolo_model


def _fallback_crop(pil_img: Image.Image, crop_ratio: float = 0.85):
    """
    Creates a safe centered crop when YOLO cannot find a suitable object.

    The crop is square and uses a percentage of the smaller image dimension.
    This prevents the YOLO Crop panel from simply displaying the original
    image when detection fails.
    """
    orig_w, orig_h = pil_img.size

    min_dim = min(orig_w, orig_h)
    crop_size = max(1, int(min_dim * crop_ratio))

    center_x = orig_w // 2
    center_y = orig_h // 2

    half_size = crop_size // 2

    x1 = max(0, center_x - half_size)
    y1 = max(0, center_y - half_size)
    x2 = min(orig_w, x1 + crop_size)
    y2 = min(orig_h, y1 + crop_size)

    # Re-adjust if clipping happened at an image boundary.
    x1 = max(0, x2 - crop_size)
    y1 = max(0, y2 - crop_size)

    cropped_img = pil_img.crop((x1, y1, x2, y2))

    return cropped_img, [x1, y1, x2, y2]


def crop_product(
    pil_img: Image.Image,
    category: str = "bottle",
    enable_yolo: bool = True,
):
    """
    Detects the product using YOLO and crops it.

    If YOLO cannot find a suitable object, a centered fallback crop is used
    instead of returning the original image.

    Returns:
        cropped_img (PIL.Image)
        bbox (list or None): [x1, y1, x2, y2]
        status_msg (str)
    """

    category = category.lower()

    # Texture categories represent the entire frame.
    texture_categories = {
        "carpet",
        "grid",
        "leather",
        "tile",
        "wood",
    }

    if category in texture_categories:
        return (
            pil_img,
            [0, 0, pil_img.width, pil_img.height],
            f"YOLO: Bypassed for texture category '{category}'",
        )

    # If YOLO is explicitly disabled, use fallback crop.
    if not enable_yolo:
        cropped_img, bbox = _fallback_crop(pil_img)

        return (
            cropped_img,
            bbox,
            f"YOLO: Disabled — using fallback crop "
            f"(Box: {bbox})",
        )

    model = get_yolo_model()

    # YOLO unavailable → fallback crop.
    if model is None:
        cropped_img, bbox = _fallback_crop(pil_img)

        return (
            cropped_img,
            bbox,
            f"YOLO: Model unavailable — using fallback crop "
            f"(Box: {bbox})",
        )

    try:
        # Convert PIL to numpy for YOLO.
        img_np = np.array(pil_img)

        # Run YOLO inference.
        results = model(img_np, verbose=False)

        if not results or len(results[0].boxes) == 0:
            cropped_img, bbox = _fallback_crop(pil_img)

            return (
                cropped_img,
                bbox,
                f"YOLO: No objects detected — using fallback crop "
                f"(Box: {bbox})",
            )

        boxes = results[0].boxes

        best_box = None
        best_area = 0

        # COCO classes relevant to some supported categories.
        target_coco_classes = {
            "bottle": [39, 41],      # bottle, cup
            "toothbrush": [79],      # toothbrush
        }

        target_ids = target_coco_classes.get(category, [])

        # ----------------------------------------------------------
        # 1. Try to find the category-specific target.
        # ----------------------------------------------------------
        for box in boxes:
            cls_id = int(box.cls[0].item())

            if cls_id in target_ids:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                area = (x2 - x1) * (y2 - y1)

                if area > best_area:
                    best_area = area
                    best_box = [
                        int(x1),
                        int(y1),
                        int(x2),
                        int(y2),
                    ]

        # ----------------------------------------------------------
        # 2. Otherwise use the largest detected object.
        # ----------------------------------------------------------
        if best_box is None:
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                area = (x2 - x1) * (y2 - y1)

                # Ignore extremely small noise boxes.
                if area > best_area and area > 1000:
                    best_area = area
                    best_box = [
                        int(x1),
                        int(y1),
                        int(x2),
                        int(y2),
                    ]

        # ----------------------------------------------------------
        # 3. No suitable YOLO box → fallback crop.
        # ----------------------------------------------------------
        if best_box is None:
            cropped_img, bbox = _fallback_crop(pil_img)

            return (
                cropped_img,
                bbox,
                f"YOLO: No suitable object found — "
                f"using fallback crop (Box: {bbox})",
            )

        x1, y1, x2, y2 = best_box

        width = x2 - x1
        height = y2 - y1

        area = width * height

        orig_w, orig_h = pil_img.size
        img_area = orig_w * orig_h

        # ----------------------------------------------------------
        # 4. Tiny YOLO detection → fallback crop.
        # ----------------------------------------------------------
        if img_area <= 0 or (area / img_area) < 0.05:
            cropped_img, bbox = _fallback_crop(pil_img)

            return (
                cropped_img,
                bbox,
                f"YOLO: Detected box too small "
                f"({area / img_area:.1%} of frame) — "
                f"using fallback crop (Box: {bbox})",
            )

        # ----------------------------------------------------------
        # 5. Add safety margin around detected object.
        # ----------------------------------------------------------
        hardware_cats = {
            "metal_nut",
            "screw",
            "hazelnut",
            "capsule",
            "pill",
            "transistor",
            "bottle",
        }

        margin_ratio = (
            0.22
            if category in hardware_cats
            else 0.10
        )

        # Make the crop square.
        max_dim = max(width, height)

        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2

        half_size = int(
            (max_dim // 2) * (1.0 + margin_ratio)
        )

        x1_pad = max(
            0,
            center_x - half_size,
        )

        y1_pad = max(
            0,
            center_y - half_size,
        )

        x2_pad = min(
            orig_w,
            center_x + half_size,
        )

        y2_pad = min(
            orig_h,
            center_y + half_size,
        )

        cropped_img = pil_img.crop(
            (x1_pad, y1_pad, x2_pad, y2_pad)
        )

        bbox = [
            x1_pad,
            y1_pad,
            x2_pad,
            y2_pad,
        ]

        status_msg = (
            "YOLO: Detected and cropped product "
            f"(Box: {bbox})"
        )

        return cropped_img, bbox, status_msg

    except Exception as e:
        logger.error(
            f"Error during YOLO cropping: {e}"
        )

        # Even on YOLO failure, don't return the original image.
        cropped_img, bbox = _fallback_crop(pil_img)

        return (
            cropped_img,
            bbox,
            f"YOLO error: {e} — "
            f"using fallback crop (Box: {bbox})",
        )