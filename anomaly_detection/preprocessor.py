import cv2
import numpy as np
from PIL import Image

def validate_and_preprocess_image(
    pil_img: Image.Image,
    blur_threshold: float = 100.0,
    min_brightness: float = 40.0,
    max_brightness: float = 230.0,
    min_contrast: float = 15.0
):
    """
    Validates the quality of the input image and performs enhancement preprocessing:
    1. Computes quality metrics: Blur (Laplacian variance), Brightness (mean), Contrast (std).
    2. Performs CLAHE contrast enhancement in LAB color space to preserve color.
    3. Performs denoising using Gaussian Blur to reduce high-frequency noise.
    4. Performs sharpness enhancement via Unsharp Masking.

    Args:
        pil_img (PIL.Image): Input image.
        blur_threshold (float): Minimum Laplacian variance for a sharp image.
        min_brightness (float): Minimum average intensity.
        max_brightness (float): Maximum average intensity.
        min_contrast (float): Minimum standard deviation of intensity.

    Returns:
        enhanced_pil (PIL.Image): Preprocessed and enhanced image.
        report (dict): Quality metrics, warnings, and validation status.
    """
    # Convert PIL Image to OpenCV BGR format
    img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Compute Quality Metrics
    # Blur detection via Laplacian variance
    blur_score = float(cv2.Laplacian(img_gray, cv2.CV_64F).var())
    
    # Brightness (mean pixel intensity)
    brightness = float(np.mean(img_gray))
    
    # Contrast (standard deviation of pixel intensity)
    contrast = float(np.std(img_gray))

    # Determine validation status and warnings
    warnings = []
    is_valid = True

    if blur_score < blur_threshold:
        warnings.append(f"Low sharpness detected (Score: {blur_score:.1f} < {blur_threshold})")
        # Don't fail the inspection completely, just warn the operator
    
    if brightness < min_brightness:
        warnings.append(f"Image is too dark (Brightness: {brightness:.1f} < {min_brightness})")
        is_valid = False
    elif brightness > max_brightness:
        warnings.append(f"Image is overexposed (Brightness: {brightness:.1f} > {max_brightness})")
        is_valid = False

    if contrast < min_contrast:
        warnings.append(f"Low contrast image (Contrast: {contrast:.1f} < {min_contrast})")
        is_valid = False

    # 2. Image Preprocessing & Enhancement
    # Step A: Contrast Enhancement using CLAHE on the L channel of LAB space
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    
    # Create CLAHE object
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    
    # Merge channels back
    enhanced_lab = cv2.merge((cl, a_channel, b_channel))
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # Step B: Denoising via a mild Gaussian filter (3x3 kernel)
    # Saves edge profiles while removing pixel-level sensor grain
    denoised_bgr = cv2.GaussianBlur(enhanced_bgr, (3, 3), 0)

    # Step C: Sharpness boost using Unsharp Masking
    # blend original + high pass to make fine edges stand out
    sharpened_bgr = cv2.addWeighted(denoised_bgr, 1.5, cv2.GaussianBlur(denoised_bgr, (5, 5), 0), -0.5, 0)

    # Convert back to PIL RGB
    enhanced_rgb = cv2.cvtColor(sharpened_bgr, cv2.COLOR_BGR2RGB)
    enhanced_pil = Image.fromarray(enhanced_rgb)

    report = {
        "blur_score": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "is_valid": is_valid,
        "warnings": warnings
    }

    return enhanced_pil, report

if __name__ == "__main__":
    # Small test logic
    print("Testing preprocessor.py...")
    # Create a dummy image
    dummy_data = np.random.randint(0, 255, (128, 128, 3), dtype=np.uint8)
    dummy_pil = Image.fromarray(dummy_data)
    
    enhanced, report = validate_and_preprocess_image(dummy_pil)
    print("Report:", report)
    print("Preprocessed Image Size:", enhanced.size)
