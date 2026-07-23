import os
from pathlib import Path


def validate_image(filename: str, upload_dir: str = None) -> dict:
    """
    Validate image file exists and is accessible
    
    Args:
        filename: Name of the file to validate
        upload_dir: Directory where file should be located
        
    Returns:
        Dictionary with validation status
    """
    if not filename:
        return {"valid": False, "error": "Filename is empty"}
    
    if upload_dir:
        filepath = os.path.join(upload_dir, filename)
    else:
        filepath = filename
    
    if not os.path.exists(filepath):
        return {"valid": False, "error": "File not found"}
    
    if not os.path.isfile(filepath):
        return {"valid": False, "error": "Path is not a file"}
    
    # Check file size (max 16MB)
    file_size = os.path.getsize(filepath)
    if file_size > 16 * 1024 * 1024:
        return {"valid": False, "error": "File too large"}
    
    if file_size == 0:
        return {"valid": False, "error": "File is empty"}
    
    return {
        "valid": True,
        "filename": filename,
        "size": file_size,
        "path": filepath
    }


def check_image_quality(image_array) -> dict:
    """
    Check image quality metrics
    
    Args:
        image_array: Numpy array of the image
        
    Returns:
        Dictionary with quality metrics
    """
    import numpy as np
    
    try:
        brightness = np.mean(image_array)
        contrast = np.std(image_array)
        
        quality_issues = []
        if brightness < 0.1:
            quality_issues.append("Image too dark")
        elif brightness > 0.9:
            quality_issues.append("Image too bright")
        
        if contrast < 0.01:
            quality_issues.append("Low contrast")
        
        return {
            "valid": len(quality_issues) == 0,
            "brightness": float(brightness),
            "contrast": float(contrast),
            "issues": quality_issues
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}
