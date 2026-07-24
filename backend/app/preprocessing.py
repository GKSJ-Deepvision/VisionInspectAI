import cv2
import numpy as np
import os
from datetime import datetime
from typing import List, Dict, Any

class IndustrialPreprocessor:
    def __init__(self, target_size=(256, 256)):
        self.target_size = target_size

    def validate_image(self, image_path: str) -> bool:
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        ext = os.path.splitext(image_path)[1].lower()
        if ext not in allowed_extensions:
            return False
        
        img = cv2.imread(image_path)
        return img is not None

    def remove_noise(self, image: np.ndarray) -> np.ndarray:
        return cv2.bilateralFilter(image, 9, 75, 75)

    def enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        yuv = cv2.cvtColor(image, cv2.COLOR_BGR2YUV)
        y, u, v = cv2.split(yuv)
        
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl_y = clahe.apply(y)
        
        enhanced_yuv = cv2.merge((cl_y, u, v))
        return cv2.cvtColor(enhanced_yuv, cv2.COLOR_YUV2BGR)

    def process_pipeline(self, input_path: str, output_directory: str) -> dict:
        start_time = datetime.now()
        
        if not self.validate_image(input_path):
            raise ValueError(f"Corrupted or unsupported image file format: {input_path}")

        raw_img = cv2.imread(input_path)
        img_format = os.path.splitext(input_path)[1].upper().replace('.', '')
        resized_img = cv2.resize(raw_img, self.target_size, interpolation=cv2.INTER_AREA)
        denoised_img = self.remove_noise(resized_img)
        final_processed_img = self.enhance_contrast(denoised_img)
        
        os.makedirs(output_directory, exist_ok=True)
        filename = os.path.basename(input_path)
        output_path = os.path.join(output_directory, f"processed_{filename}")
        cv2.imwrite(output_path, final_processed_img)
        
        latency_ms = (datetime.now() - start_time).total_seconds() * 1000.0
        
        return {
            "processed_image_path": output_path,
            "image_format": img_format,
            "processing_latency_ms": round(latency_ms, 2)
        }

    def batch_process(self, input_paths: List[str], output_directory: str) -> List[dict]:
        results = []
        for path in input_paths:
            try:
                res = self.process_pipeline(path, output_directory)
                results.append(res)
            except Exception as e:
                results.append({"error": str(e), "input_path": path})
        return results

    def generate_quality_report(self, image: np.ndarray) -> Dict[str, Any]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur_val = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        return {
            "blur_metric": blur_val,
            "brightness": brightness,
            "contrast": contrast,
            "quality_status": "GOOD" if blur_val > 50 and 50 < brightness < 200 else "POOR"
        }
