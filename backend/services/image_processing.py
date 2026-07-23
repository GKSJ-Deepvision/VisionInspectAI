import os
from pathlib import Path
import numpy as np
from PIL import Image


def allowed_file(filename: str) -> bool:
    """Check if file is a valid image format"""
    return Path(filename).suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}


def process_image(image_path: str) -> dict:
    """
    Preprocess image for inference
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with processing status and image info
    """
    try:
        if not os.path.exists(image_path):
            return {"success": False, "error": "File not found"}
        
        if not allowed_file(image_path):
            return {"success": False, "error": "Invalid image format"}
        
        # Load image
        img = Image.open(image_path)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Store original size
        orig_size = img.size
        
        # Resize to standard dimensions (224x224 for PatchCore)
        img_resized = img.resize((224, 224))
        
        # Convert to numpy array and normalize
        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        
        return {
            "success": True,
            "original_size": orig_size,
            "resized_size": (224, 224),
            "shape": img_array.shape,
            "dtype": str(img_array.dtype),
            "min": float(np.min(img_array)),
            "max": float(np.max(img_array)),
            "mean": float(np.mean(img_array))
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
