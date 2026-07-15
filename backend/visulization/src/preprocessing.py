import cv2
import numpy as np

IMAGE_SIZE = (256, 256)

def load_image(image_path):
    """
    Load image and convert it from BGR to RGB.
    """

    image = cv2.imread(str(image_path))

    if image is None:
        raise FileNotFoundError(
            f"Could not load image: {image_path}"
        )

    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

def resize_image(image, size=IMAGE_SIZE):
    """
    Resize image for model input.
    """
    return cv2.resize(
        image,
        size,
        interpolation=cv2.INTER_AREA
    )

def enhance_contrast(image, clip_limit=2.0, tile_grid_size=(8,8)):
    """
    Apply CLAHE to improve local contrast.
    Useful for low-contrast defects.
    """
    lab = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2LAB
    )

    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=clip_limit,
        tileGridSize=tile_grid_size
    )

    l = clahe.apply(l)

    enhanced = cv2.merge(
        [l, a, b]
    )

    return cv2.cvtColor(
        enhanced,
        cv2.COLOR_LAB2RGB
    )

def remove_noise(image, h=5, h_color=5, template_size=7, search_size=21):
    """
    Reduce image noise while preserving edges.
    """
    return cv2.fastNlMeansDenoisingColored(
        image,
        None,
        h,
        h_color,
        template_size,
        search_size
    )

def normalize(image):
    """
    Convert image values from 0-255 to 0-1.
    """
    return image.astype(
        np.float32
    ) / 255.0

def preprocess_image(
    image_path,
    use_denoising=False,
    use_clahe=True
):
    """
    Main preprocessing pipeline.
    """
    image = load_image(
        image_path
    )
    image = resize_image(
        image
    )
    if use_denoising:
        image = remove_noise(
            image
        )
    if use_clahe:
        image = enhance_contrast(
            image
        )    
    image = normalize(
        image
    )
    return image