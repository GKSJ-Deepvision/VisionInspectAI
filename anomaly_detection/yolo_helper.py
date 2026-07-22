import os
import sys
import logging
from pathlib import Path
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
            # Use the nano model for fast inference and small footprint
            logger.info("Loading pre-trained YOLOv8n model...")
            _yolo_model = YOLO("yolov8n.pt")
            logger.info("YOLOv8n model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load YOLOv8: {e}. YOLO integration will run in mock/bypass mode.")
            _yolo_model = None
    return _yolo_model

def crop_product(pil_img: Image.Image, category: str = "bottle", enable_yolo: bool = True):
    """
    Detects the product in the image using YOLO and crops it.
    Returns:
        cropped_img (PIL.Image): The cropped image (or original if YOLO is disabled/fails)
        bbox (list or None): [x1, y1, x2, y2] bounding box coordinates relative to original size
        status_msg (str): Information message about the crop status
    """
    category = category.lower()
    
    # 1. Texture Category Bypass: textures cover the entire frame, so object cropping is not applicable
    texture_categories = {"carpet", "grid", "leather", "tile", "wood"}
    if category in texture_categories:
        return pil_img, None, f"YOLO: Bypassed for texture category '{category}'"

    if not enable_yolo:
        return pil_img, None, "YOLO preprocessing disabled (Bypass mode)"
        
    model = get_yolo_model()
    if model is None:
        return pil_img, None, "YOLO model not available (Fallback to full image)"
        
    try:
        # Convert PIL to numpy for YOLO
        img_np = np.array(pil_img)
        
        # Run inference
        # verbose=False reduces terminal clutter during presentation
        results = model(img_np, verbose=False)
        
        if not results or len(results[0].boxes) == 0:
            return pil_img, None, "YOLO: No objects detected (Fallback to full image)"
            
        boxes = results[0].boxes
        best_box = None
        best_area = 0
        
        # Class names map for specific targeting
        # COCO class 39 is 'bottle', 41 is 'cup', 43 is 'knife', etc.
        target_coco_classes = {
            "bottle": [39, 41],  # bottle, cup
            "toothbrush": [79],   # toothbrush
        }
        
        # NOTE: We do NOT reject images based on detected COCO class.
        # MVTec images are top-down industrial macro shots that YOLO (trained on COCO)
        # will never confidently match to bottle/cup/etc. — any rejection logic here
        # would block every legitimate MVTec image. Instead we just crop the
        # largest detected object and fall back to the full image if nothing found.

        # Check if we have specific target classes for the active category
        target_ids = target_coco_classes.get(category.lower(), [])
        
        # 1. First pass: try to find the target class
        for box in boxes:
            cls_id = int(box.cls[0].item())
            if cls_id in target_ids:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                area = (x2 - x1) * (y2 - y1)
                if area > best_area:
                    best_area = area
                    best_box = [int(x1), int(y1), int(x2), int(y2)]
                    
        # 2. Second pass fallback: if no target class matches, crop the largest detected object
        if best_box is None:
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                area = (x2 - x1) * (y2 - y1)
                # Ignore extremely small noise boxes
                if area > best_area and area > 1000:
                    best_area = area
                    best_box = [int(x1), int(y1), int(x2), int(y2)]
                    
        if best_box is not None:
            x1, y1, x2, y2 = best_box
            
            width = x2 - x1
            height = y2 - y1
            area = width * height
            orig_w, orig_h = pil_img.size
            img_area = orig_w * orig_h
            if (area / img_area) < 0.05:
                return pil_img, None, f"YOLO: Bypassed tiny crop ({area/img_area:.1%} of frame)"
                
            # Hardware / Small items require generous safety margin (20%) and square aspect ratio
            hardware_cats = {"metal_nut", "screw", "hazelnut", "capsule", "pill", "transistor", "bottle"}
            margin_ratio = 0.22 if category in hardware_cats else 0.10
            
            # Make bounding box a square 1:1 centered box to prevent clipping half the object
            max_dim = max(width, height)
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            
            half_size = int((max_dim // 2) * (1.0 + margin_ratio))
            
            x1_pad = max(0, center_x - half_size)
            y1_pad = max(0, center_y - half_size)
            x2_pad = min(orig_w, center_x + half_size)
            y2_pad = min(orig_h, center_y + half_size)
            
            cropped_img = pil_img.crop((x1_pad, y1_pad, x2_pad, y2_pad))
            status_msg = f"YOLO: Detected and cropped product (Box: [{x1_pad}, {y1_pad}, {x2_pad}, {y2_pad}])"
            return cropped_img, [x1_pad, y1_pad, x2_pad, y2_pad], status_msg
            
        return pil_img, None, "YOLO: No suitable object found (Fallback to full image)"
        
    except Exception as e:
        logger.error(f"Error during YOLO cropping: {e}")
        return pil_img, None, f"YOLO error: {e} (Fallback to full image)"
