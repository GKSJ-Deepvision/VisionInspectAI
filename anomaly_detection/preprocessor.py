import cv2
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

# ── Category Taxonomy for Industrial Preprocessing ──────────────────────────
TEXTURE_CATEGORIES = {"carpet", "grid", "leather", "tile", "wood"}
ORIENTED_CATEGORIES = {"transistor", "screw", "cable", "toothbrush", "zipper", "capsule"}
UNORIENTED_OBJECT_CATEGORIES = {"bottle", "hazelnut", "metal_nut", "pill"}


class LetterboxPad:
    """
    Pads an image to a 1:1 square aspect ratio with letterbox padding before resizing.
    Prevents geometric distortion (e.g. stretching circular/rectangular objects into warped aspect ratios).
    """
    def __init__(self, fill=0, padding_mode="constant"):
        self.fill = fill
        self.padding_mode = padding_mode

    def __call__(self, img: Image.Image) -> Image.Image:
        w, h = img.size
        if w == h:
            return img
        max_dim = max(w, h)
        hp = (max_dim - w) // 2
        vp = (max_dim - h) // 2
        # padding format: (left, top, right, bottom)
        padding = (hp, vp, max_dim - w - hp, max_dim - h - vp)
        return transforms.functional.pad(img, padding, fill=self.fill, padding_mode=self.padding_mode)

    def __repr__(self):
        return f"{self.__class__.__name__}(fill={self.fill}, padding_mode={self.padding_mode})"


def get_category_transforms(
    category: str = "bottle",
    split: str = "train",
    image_size: tuple = (128, 128)
) -> transforms.Compose:
    """
    Returns category-optimized PyTorch transforms for MVTec AD anomaly detection.
    Guarantees strict parity between training and inference preprocessing pipelines.

    Args:
        category (str): MVTec category name (e.g. 'bottle', 'carpet', 'transistor').
        split (str): 'train', 'test', or 'eval'.
        image_size (tuple): Target (Height, Width) for Autoencoder input.

    Returns:
        transforms.Compose: PyTorch torchvision transform composition.
    """
    category = category.lower()
    is_texture = category in TEXTURE_CATEGORIES
    is_oriented = category in ORIENTED_CATEGORIES

    transform_list = []

    # 1. Aspect Ratio Handling
    # Textures span full frame — padding adds artificial black border artifacts.
    # Objects use Letterbox Square Padding to maintain physical aspect ratios.
    if not is_texture:
        transform_list.append(LetterboxPad(fill=0, padding_mode="constant"))

    # 2. Resizing with Antialiasing
    # Antialiasing is critical when downsampling 1024x1024 industrial images to 128x128
    # to prevent high-frequency Moiré aliasing artifacts.
    transform_list.append(
        transforms.Resize(
            image_size,
            interpolation=transforms.InterpolationMode.BILINEAR,
            antialias=True
        )
    )

    # 3. Category-Aware Data Augmentation (Train split only)
    if split == "train":
        if is_texture:
            # Textures are orientation invariant
            transform_list.extend([
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomVerticalFlip(p=0.5),
            ])
        elif is_oriented:
            # Oriented objects (e.g. transistor legs, zipper direction, screw threads)
            # must NOT use vertical flips to preserve structural canonical orientation.
            transform_list.append(transforms.RandomHorizontalFlip(p=0.5))
        else:
            # Unoriented objects (e.g. bottle, hazelnut, metal_nut, pill)
            transform_list.extend([
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomVerticalFlip(p=0.5),
            ])

    # 4. Pixel Scaling & Tensor Conversion [0, 255] uint8 → [0.0, 1.0] float32 (C, H, W)
    transform_list.append(transforms.ToTensor())

    return transforms.Compose(transform_list)


def validate_and_preprocess_image(
    pil_img: Image.Image,
    blur_threshold: float = 100.0,
    min_brightness: float = 40.0,
    max_brightness: float = 230.0,
    min_contrast: float = 15.0,
    enhance: bool = False
):
    """
    Validates quality of input image and optionally performs enhancement.

    Args:
        pil_img (PIL.Image): Input image (RGB).
        blur_threshold (float): Minimum Laplacian variance for sharp image.
        min_brightness (float): Minimum average intensity.
        max_brightness (float): Maximum average intensity.
        min_contrast (float): Minimum standard deviation of intensity.
        enhance (bool): If True, applies CLAHE and sharpening. Default False to
                        preserve raw pixel values for Autoencoder reconstruction parity.

    Returns:
        processed_pil (PIL.Image): Preprocessed PIL image.
        report (dict): Quality metrics, warnings, and validation status.
    """
    # Ensure PIL image is in RGB format
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")

    # Convert PIL Image (RGB) to OpenCV BGR format for quality metric calculations
    img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Compute Quality Metrics
    blur_score = float(cv2.Laplacian(img_gray, cv2.CV_64F).var())
    brightness = float(np.mean(img_gray))
    contrast = float(np.std(img_gray))

    warnings = []
    is_valid = True

    if blur_score < blur_threshold:
        warnings.append(f"Low sharpness detected (Score: {blur_score:.1f} < {blur_threshold})")

    if brightness < min_brightness:
        warnings.append(f"Image is too dark (Brightness: {brightness:.1f} < {min_brightness})")
        is_valid = False
    elif brightness > max_brightness:
        warnings.append(f"Image is overexposed (Brightness: {brightness:.1f} > {max_brightness})")
        is_valid = False

    if contrast < min_contrast:
        warnings.append(f"Low contrast image (Contrast: {contrast:.1f} < {min_contrast})")
        is_valid = False

    # 2. Image Preprocessing / Enhancement
    if enhance:
        # Step A: CLAHE contrast enhancement in LAB space
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l_channel)
        enhanced_lab = cv2.merge((cl, a_channel, b_channel))
        enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # Step B: Denoising via a mild Gaussian filter (3x3 kernel)
        denoised_bgr = cv2.GaussianBlur(enhanced_bgr, (3, 3), 0)

        # Step C: Sharpness boost using Unsharp Masking
        sharpened_bgr = cv2.addWeighted(denoised_bgr, 1.5, cv2.GaussianBlur(denoised_bgr, (5, 5), 0), -0.5, 0)
        enhanced_rgb = cv2.cvtColor(sharpened_bgr, cv2.COLOR_BGR2RGB)
        processed_pil = Image.fromarray(enhanced_rgb)
    else:
        # Pass raw image without destructive pixel histogram modifications
        processed_pil = pil_img.copy()

    report = {
        "blur_score": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "is_valid": is_valid,
        "warnings": warnings
    }

    return processed_pil, report


if __name__ == "__main__":
    print("Testing updated preprocessor.py...")
    dummy_data = np.random.randint(0, 255, (128, 256, 3), dtype=np.uint8)
    dummy_pil = Image.fromarray(dummy_data)

    enhanced, report = validate_and_preprocess_image(dummy_pil, enhance=False)
    print("Report:", report)
    print("Processed Image Size:", enhanced.size)

    tf_train = get_category_transforms("transistor", split="train")
    tf_test = get_category_transforms("transistor", split="test")
    tensor_out = tf_test(dummy_pil)
    print("Test transform tensor shape:", tensor_out.shape, "range:", tensor_out.min().item(), "-", tensor_out.max().item())
