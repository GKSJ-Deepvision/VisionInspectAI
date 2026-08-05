import cv2
import numpy as np
from PIL import Image


def localize_defects(
    anomaly_map: np.ndarray,
    threshold: float,
    original_img: Image.Image,
    min_area: int = 25
) -> dict:
    """
    Performs defect localization on 2D per-pixel anomaly score map using morphological processing,
    connected component analysis, and contour extraction.

    Args:
        anomaly_map (np.ndarray): 2D heatmap array of shape (H, W).
        threshold (float): Anomaly score threshold for binarization.
        original_img (PIL.Image): Original input image (RGB).
        min_area (int): Minimum pixel area for a valid defect region.

    Returns:
        dict: Contains bounding_boxes, segmentation_mask (PIL), contour_overlay (PIL),
              and localized_regions list.
    """
    H, W = anomaly_map.shape
    orig_np = np.array(original_img.resize((W, H)))

    # 1. Adaptive Binarization
    # Pixel is defective if anomaly score exceeds threshold
    binary_mask = (anomaly_map > threshold).astype(np.uint8) * 255

    # 2. Morphological Operations to clean up noise and join adjacent defect fragments
    kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    kernel_large = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

    # Morphological Opening (removes small isolated noisy pixels)
    opened = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel_small)

    # Morphological Closing (fills internal micro-holes in defect regions)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel_large)

    # 3. Connected Components Analysis
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(closed, connectivity=8)

    bounding_boxes = []
    localized_regions = []

    overlay_np = orig_np.copy()
    mask_np = np.zeros((H, W), dtype=np.uint8)

    for i in range(1, num_labels):  # Skip background (label 0)
        area = stats[i, cv2.CC_STAT_AREA]
        if area < min_area:
            continue

        x = int(stats[i, cv2.CC_STAT_LEFT])
        y = int(stats[i, cv2.CC_STAT_TOP])
        w = int(stats[i, cv2.CC_STAT_WIDTH])
        h = int(stats[i, cv2.CC_STAT_HEIGHT])
        cx, cy = float(centroids[i][0]), float(centroids[i][1])

        bounding_boxes.append([x, y, w, h])

        # Region-specific anomaly submap
        region_score = float(np.mean(anomaly_map[y:y+h, x:x+w]))

        localized_regions.append({
            "bbox": [x, y, w, h],
            "area_pixels": int(area),
            "centroid": [round(cx, 1), round(cy, 1)],
            "region_anomaly_score": round(region_score, 4)
        })

        # Draw red bounding box and shaded overlay on defect regions
        cv2.rectangle(overlay_np, (x, y), (x + w, y + h), (255, 0, 0), 2)
        cv2.putText(
            overlay_np,
            f"Defect ({int(area)}px)",
            (x, max(15, y - 5)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (255, 50, 50),
            1,
            cv2.LINE_AA
        )
        mask_np[labels == i] = 255

    # 4. Contour Extraction
    contours, _ = cv2.findContours(mask_np, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(overlay_np, contours, -1, (0, 255, 255), 1)  # Yellow contours

    # Create PIL Images
    segmentation_mask_pil = Image.fromarray(mask_np)
    contour_overlay_pil = Image.fromarray(overlay_np)

    # Primary (largest) bounding box for summary
    primary_bbox = bounding_boxes[0] if bounding_boxes else [0, 0, W, H]

    return {
        "bounding_boxes": bounding_boxes,
        "primary_bbox": primary_bbox,
        "localized_regions": localized_regions,
        "defect_count": len(bounding_boxes),
        "total_defect_area": int(np.sum(mask_np > 0)),
        "segmentation_mask": segmentation_mask_pil,
        "overlay_image": contour_overlay_pil
    }
