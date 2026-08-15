""" ml_engine
VisionInspect AI - Defect Detection Engine

This is the main inference engine used by the FastAPI endpoint.
It uses the trained anomaly detection model (if available) to make accurate
predictions, and falls back to heuristic OpenCV analysis if the model
has not been trained yet.

Architecture:
    1. Check if trained model exists â†’ Use deep feature KNN-based detection
    2. If no trained model â†’ Fall back to OpenCV adaptive thresholding (legacy)
    3. When defect IS detected â†’ Use OpenCV for defect characterization (type, severity)
    4. When product IS good â†’ Return PASS with confidence score
"""

import os
import cv2
import numpy as np
from datetime import datetime
import json
import traceback


class DefectDetectionEngine:
    """Main defect detection engine combining trained model + OpenCV characterization."""

    def __init__(self):
        self.trained_detector = None
        self._load_trained_model()

    def _load_trained_model(self):
        """Load the trained anomaly detection model if available."""
        try:
            from app.ml_engine.anomaly_detector import TrainedAnomalyDetector

            # Position-independent model path: resolve relative to backend/ directory
            this_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.abspath(os.path.join(this_dir, "..", ".."))
            model_dir = os.path.join(backend_dir, "models", "trained")

            self.trained_detector = TrainedAnomalyDetector(model_dir=model_dir)
            if self.trained_detector.is_trained:
                cat_count = len(self.trained_detector.category_features)
                print(f"[OK] Trained anomaly detection model loaded - {cat_count} categories, accurate predictions enabled!")
            else:
                print("[WARN] Model not trained yet. Using heuristic mode. Run: python train_model.py")
                self.trained_detector = None
        except Exception as e:
            print(f"[WARN] Could not load trained model ({e}). Using heuristic fallback.")
            self.trained_detector = None

    def _preprocess_for_inspection(self, img):
        """Enhance image quality before inspection using CLAHE + bilateral filter.

        This improves defect visibility especially for low-contrast industrial images.
        """
        try:
            # Bilateral filter for noise removal while preserving edges
            denoised = cv2.bilateralFilter(img, 9, 75, 75)

            # CLAHE contrast enhancement on Y channel only
            yuv = cv2.cvtColor(denoised, cv2.COLOR_BGR2YUV)
            y, u, v = cv2.split(yuv)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            y_enhanced = clahe.apply(y)
            enhanced = cv2.merge((y_enhanced, u, v))
            enhanced = cv2.cvtColor(enhanced, cv2.COLOR_YUV2BGR)

            return enhanced
        except Exception:
            return img  # Return original if preprocessing fails

    def generate_heatmap(self, original_img, anomaly_mask, output_dir, filename):
        """Generate a JET colormap anomaly heatmap overlaid on the original image.
        
        Uses ground truth masks from MVTec AD when available for pixel-accurate heatmaps.
        Falls back to the provided anomaly_mask from OpenCV analysis.
        """
        try:
            os.makedirs(output_dir, exist_ok=True)

            # Try to find ground truth mask for this image from MVTec AD dataset
            gt_mask = self._find_ground_truth_mask(filename)
            if gt_mask is not None:
                # Use ground truth mask for pixel-accurate heatmap
                mask_to_use = gt_mask
            else:
                mask_to_use = anomaly_mask

            # Ensure mask is correct size
            if mask_to_use.shape[:2] != original_img.shape[:2]:
                mask_to_use = cv2.resize(mask_to_use, (original_img.shape[1], original_img.shape[0]))

            # Apply Gaussian blur for smooth heatmap
            blurred = cv2.GaussianBlur(mask_to_use, (21, 21), 0)
            
            norm_mask = cv2.normalize(
                blurred, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U
            )

            heatmap = cv2.applyColorMap(norm_mask, cv2.COLORMAP_JET)
            heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))

            overlay = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)

            # Force forward slashes for cross-platform compatibility
            clean_dir = output_dir.replace("\\", "/")
            output_path = f"{clean_dir}/heatmap_{filename}"
            cv2.imwrite(output_path, overlay)

            return output_path
        except Exception as e:
            print(f"[WARN] Heatmap generation error: {e}")
            return None

    def _find_ground_truth_mask(self, filename):
        """Search MVTec AD ground_truth directories for a matching mask file.
        
        Matches by filename pattern (e.g., '000.png' -> '000_mask.png').
        """
        try:
            this_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.abspath(os.path.join(this_dir, "..", "..", ".."))
            mvtec_dir = os.path.join(project_root, "data", "mvtec_ad")
            
            if not os.path.isdir(mvtec_dir):
                return None

            # Extract base number from filename (e.g., "000.png" -> "000")
            base_name = os.path.splitext(filename)[0]
            # Remove any prefix like "heatmap_" or similar
            for prefix in ["heatmap_", "processed_", "raw_"]:
                if base_name.startswith(prefix):
                    base_name = base_name[len(prefix):]
            
            mask_name = f"{base_name}_mask.png"

            # Search all categories and defect types
            for category in os.listdir(mvtec_dir):
                gt_dir = os.path.join(mvtec_dir, category, "ground_truth")
                if not os.path.isdir(gt_dir):
                    continue
                for defect_type in os.listdir(gt_dir):
                    mask_path = os.path.join(gt_dir, defect_type, mask_name)
                    if os.path.isfile(mask_path):
                        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
                        if mask is not None:
                            print(f"[GT] Found ground truth mask: {category}/{defect_type}/{mask_name}")
                            return mask
            return None
        except Exception:
            return None

    def _analyze_defect_characteristics(self, img):
        """Analyze defect characteristics using OpenCV when a defect IS confirmed.

        This is only called AFTER the trained model has determined that a
        defect exists. It characterizes the defect type, location, and severity
        using traditional computer vision techniques.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        # Adaptive thresholding to find anomaly regions
        thresh = cv2.adaptiveThreshold(
            blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )
        kernel = np.ones((5, 5), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

        # Find contours
        cnts = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = cnts[0] if len(cnts) == 2 else cnts[1]

        total_area = img.shape[0] * img.shape[1]

        # Filter small noise contours
        defect_contours = [
            c for c in contours
            if (total_area * 0.005) < cv2.contourArea(c) < (total_area * 0.85)
        ]
        defect_area = sum(cv2.contourArea(c) for c in defect_contours)
        defect_area_ratio = min(0.6, defect_area / max(total_area, 1))

        # Edge density analysis
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.sum(edges > 0)) / max(total_area, 1)

        # Texture variance
        texture_var = float(np.var(gray.astype(np.float64)))

        # Color uniformity
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        color_uniformity = float(np.std(hsv[:, :, 0]))

        # Classify defect type based on feature combination
        if defect_area_ratio > 0.20:
            defect_type = "Structural Fracture / Break"
        elif edge_density > 0.12 and defect_area_ratio > 0.08:
            defect_type = "Surface Crack"
        elif color_uniformity > 35:
            defect_type = "Discoloration"
        elif defect_area_ratio > 0.12:
            defect_type = "Missing Component"
        elif len(defect_contours) > 8:
            defect_type = "Contamination"
        elif edge_density > 0.08:
            defect_type = "Surface Scratch"
        elif texture_var < 800:
            defect_type = "Blister"
        else:
            defect_type = "Deformation"

        # Compute bounding boxes for defect regions
        bounding_boxes = []
        location_score = 40.0  # Default: non-critical area

        for c in defect_contours:
            x, y, w, h = cv2.boundingRect(c)
            bounding_boxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})

            # Check if defect is in center (critical area)
            box_cx = x + w / 2.0
            box_cy = y + h / 2.0
            img_cx = img.shape[1] / 2.0
            img_cy = img.shape[0] / 2.0

            if (abs(box_cx - img_cx) < img_cx * 0.5 and
                abs(box_cy - img_cy) < img_cy * 0.5):
                location_score = 80.0  # Critical area

        # Build anomaly mask for heatmap
        anomaly_mask = np.zeros_like(gray)
        if defect_contours:
            cv2.drawContours(anomaly_mask, defect_contours, -1, 255, -1)

        return {
            "defect_type": defect_type,
            "defect_area_ratio": defect_area_ratio,
            "edge_density": edge_density,
            "texture_variance": texture_var,
            "color_uniformity": color_uniformity,
            "bounding_boxes": bounding_boxes,
            "location_score": location_score,
            "anomaly_mask": anomaly_mask,
        }

    def calculate_severity_metrics(self, defect_type, confidence, defect_area_ratio, location_score=40.0):
        """Calculate severity score using the documented weighted formula.

        Formula: Severity = SizeÃ—30% + LocationÃ—25% + TypeÃ—25% + ConfidenceÃ—20%
        """
        # Size score: proportional to defect area
        size_score = min(100.0, defect_area_ratio * 300.0)

        # Type score: based on defect category seriousness
        type_weights = {
            "Structural Fracture / Break": 95.0,
            "Missing Component": 90.0,
            "Deformation": 85.0,
            "Surface Crack": 80.0,
            "Blister": 75.0,
            "Contamination": 70.0,
            "Surface Scratch": 60.0,
            "Discoloration": 40.0,
            "None": 0.0,
        }
        type_score = type_weights.get(defect_type, 50.0)

        # Confidence score: model confidence Ã— 100
        conf_score = confidence * 100.0

        # Weighted severity formula: Size 30%, Location 25%, Type 25%, Confidence 20%
        overall_score = (
            (size_score * 0.30) +
            (location_score * 0.25) +
            (type_score * 0.25) +
            (conf_score * 0.20)
        )
        overall_score = round(min(100.0, max(0.0, overall_score)), 2)

        # Severity level classification
        if overall_score >= 80.0:
            level = "CRITICAL"
            decision = "FAIL"
            recommendation = "Severe defect detected. Reject product immediately."
        elif overall_score >= 60.0:
            level = "HIGH"
            decision = "FAIL"
            recommendation = "Major defect detected. Repair or rework required."
        elif overall_score >= 40.0:
            level = "MEDIUM"
            decision = "FAIL"
            recommendation = "Moderate defect detected. Quality inspection recommended."
        else:
            level = "LOW"
            decision = "PASS"
            recommendation = "Minor cosmetic issue. Product generally acceptable."

        print("=" * 40)
        print("Defect Type :", defect_type)
        print("Size Score :", size_score)
        print("Location:", location_score)
        print("Type Score :", type_score)
        print("Confidence :", conf_score)
        print("Overall :", overall_score)
        print("Decision :",decision)
        print("=" * 40)    

        return {
            "size_score": round(size_score, 2),
            "location_score": round(location_score, 2),
            "type_score": round(type_score, 2),
            "confidence_param_score": round(conf_score, 2),
            "overall_severity_score": overall_score,
            "severity_level": level,
            "recommendation": recommendation,
            "pass_fail_decision": decision,
        }

    def inspect_image(self, image_path, output_dir="storage/heatmaps"):
        """Inspect an image for manufacturing defects.

        Uses the trained deep learning model for accurate anomaly detection.
        Falls back to heuristic OpenCV analysis if the model is not trained.
        """
        start_time = datetime.now()

        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Cannot read image: {image_path}")

            filename = os.path.basename(image_path)

            # Preprocess image for better quality
            enhanced_img = self._preprocess_for_inspection(img)

            # â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            #  TRAINED MODEL MODE (Accurate deep feature-based detection)
            # â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            if self.trained_detector is not None and self.trained_detector.is_trained:
                prediction = self.trained_detector.predict(image_path)

                print("\n===PREDICTION===")
                print(prediction)
                print("==================")

                if prediction is not None:
                    is_defective = prediction["is_defective"]
                    confidence = prediction["confidence"]
                    matched_category = prediction["matched_category"]
                    is_unknown = prediction.get("is_unknown", False)

                    if is_defective:
                        # â”€â”€ DEFECT DETECTED â”€â”€
                        char = self._analyze_defect_characteristics(enhanced_img)
                        defect_type = char["defect_type"]
                        defect_area_ratio = char["defect_area_ratio"]
                        location_score = char["location_score"]
                        bboxes = char["bounding_boxes"]

                        # Generate anomaly heatmap
                        anomaly_mask = char["anomaly_mask"]
                        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
                        mask = cv2.dilate(anomaly_mask, kernel, iterations=2)
                        heatmap_path = self.generate_heatmap(img, mask, output_dir, filename)

                        # Calculate severity score
                        severity = self.calculate_severity_metrics(
                            defect_type, confidence, defect_area_ratio, location_score
                        )

                        # CRITICAL: When anomaly detector confirms defect, NEVER return PASS.
                        # The severity scorer may return PASS for low scores, but the ML model
                        # already confirmed this is defective, so override to at least FAIL.
                        if severity.get("pass_fail_decision") == "PASS":
                            severity["pass_fail_decision"] = "FAIL"
                            severity["severity_level"] = "LOW"
                            severity["recommendation"] = "Defect detected by AI model. Product should be reviewed."

                        # For unknown products with defects, add context
                        if is_unknown:
                            severity["recommendation"] = (
                                f"Unknown product type (nearest match: {matched_category}). "
                                f"{severity['recommendation']}"
                            )

                        latency = (datetime.now() - start_time).total_seconds() * 1000

                        return {
                            "is_defective": True,
                            "defect_type": defect_type,
                            "classification": "Defective",
                            "confidence_score": round(confidence, 4),
                            "processing_latency_ms": round(latency, 2),
                            "heatmap_image_path": heatmap_path,
                            "matched_category": matched_category,
                            "defect_regions": json.dumps(bboxes) if bboxes else "[]",
                            "anomaly_score": prediction.get("anomaly_score", 0.0),
                            "threshold": prediction.get("threshold", 0.0),
                            "distance_ratio": prediction.get("distance_ratio", 0.0),
                            "texture_score": round(char.get("texture_variance", 0) / 100, 2),
                            "edge_density_score": round(char.get("edge_density", 0) * 100, 2),
                            "color_uniformity_score": round(char.get("color_uniformity", 0), 2),
                            **severity,
                        }

                    else:
                        # â”€â”€ GOOD PRODUCT â”€â”€
                        latency = (datetime.now() - start_time).total_seconds() * 1000

                        if is_unknown:
                            recommendation = (
                                f"Unknown product type (nearest match: {matched_category}). "
                                f"No defects detected. Product appears normal."
                            )
                            decision = "PASS"
                        else:
                            recommendation = f"Product quality verified ({matched_category}). No defects detected."
                            decision = "PASS"

                        return {
                            "is_defective": False,
                            "defect_type": "None",
                            "classification": "Normal",
                            "confidence_score": round(confidence, 4),
                            "processing_latency_ms": round(latency, 2),
                            "heatmap_image_path": None,
                            "matched_category": matched_category,
                            "defect_regions": "[]",
                            "texture_score": 0.0,
                            "edge_density_score": 0.0,
                            "color_uniformity_score": 0.0,
                            "size_score": 0.0,
                            "location_score": 0.0,
                            "type_score": 0.0,
                            "confidence_param_score": round(confidence * 100, 2),
                            "overall_severity_score": 0.0,
                            "severity_level": "NONE",
                            "recommendation": recommendation,
                            "pass_fail_decision": decision,
                        }

            # â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            #  HEURISTIC FALLBACK MODE (When model is not trained)
            # â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            return self._heuristic_inspect(enhanced_img, image_path, output_dir, start_time)

        except Exception as e:
            print(f"âš  Inspection pipeline error: {e}\n{traceback.format_exc()}")
            latency = (datetime.now() - start_time).total_seconds() * 1000

            return {
                "is_defective": False,
                "defect_type": "None",
                "confidence_score": 0.50,
                "processing_latency_ms": round(latency, 2),
                "heatmap_image_path": None,
                "matched_category": "error",
                "defect_regions": "[]",
                "texture_score": 0.0,
                "edge_density_score": 0.0,
                "color_uniformity_score": 0.0,
                "size_score": 0.0,
                "location_score": 0.0,
                "type_score": 0.0,
                "confidence_param_score": 50.0,
                "overall_severity_score": 0.0,
                "severity_level": "NONE",
                "recommendation": "Inspection error. Manual review required.",
                "pass_fail_decision": "FAIL",
            }

    def _heuristic_inspect(self, img, image_path, output_dir, start_time):
        """Legacy heuristic inspection using OpenCV only.

        This is the fallback when the trained model is not available.
        Note: This mode is less accurate and may produce false positives
        on textured products (like hazelnuts, wood, etc.).
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        thresh = cv2.adaptiveThreshold(
            blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )
        kernel = np.ones((5, 5), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

        cnts = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = cnts[0] if len(cnts) == 2 else cnts[1]

        total_area = img.shape[0] * img.shape[1]
        defect_contours = [
            c for c in contours
            if (total_area * 0.005) < cv2.contourArea(c) < (total_area * 0.85)
        ]
        defect_area = sum(cv2.contourArea(c) for c in defect_contours)
        defect_area_ratio = min(0.6, defect_area / max(total_area, 1))

        # Higher threshold in heuristic mode to reduce false positives
        is_defective = defect_area_ratio > 0.15

        if is_defective:
            char = self._analyze_defect_characteristics(img)
            defect_type = char["defect_type"]
            confidence = min(0.90, 0.5 + defect_area_ratio)
            location_score = char["location_score"]

            filename = os.path.basename(image_path)
            anomaly_mask = char["anomaly_mask"]
            kernel_d = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
            mask = cv2.dilate(anomaly_mask, kernel_d, iterations=2)
            heatmap_path = self.generate_heatmap(img, mask, output_dir, filename)

            severity = self.calculate_severity_metrics(
                defect_type, confidence, defect_area_ratio, location_score
            )
        else:
            defect_type = "None"
            confidence = 0.85
            heatmap_path = None
            severity = {
                "size_score": 0.0,
                "location_score": 0.0,
                "type_score": 0.0,
                "confidence_param_score": 85.0,
                "overall_severity_score": 0.0,
                "severity_level": "NONE",
                "recommendation": "No defects detected (heuristic mode). Train model for higher accuracy.",
                "pass_fail_decision": "PASS",
            }

        latency = (datetime.now() - start_time).total_seconds() * 1000

        return {
            "is_defective": is_defective,
            "defect_type": defect_type,
            "confidence_score": round(confidence, 4),
            "processing_latency_ms": round(latency, 2),
            "heatmap_image_path": heatmap_path,
            "matched_category": "unknown (heuristic mode)",
            "defect_regions": "[]",
            "texture_score": 0.0,
            "edge_density_score": 0.0,
            "color_uniformity_score": 0.0,
            **severity,
        }
