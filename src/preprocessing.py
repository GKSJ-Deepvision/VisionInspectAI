import cv2

IMAGE_SIZE = (256, 256)

def preprocess_image(image_path):
    """
    Read and preprocess an image for the anomaly detection model.
    """
    image = cv2.imread(str(image_path))

    if image is None:
        raise FileNotFoundError(f"Unable to read image: {image_path}")
    # OpenCV loads images in BGR format
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # Resize to the model's expected input size
    image = cv2.resize(image, IMAGE_SIZE)
    # Scale pixel values to [0, 1]
    image = image.astype("float32") / 255.0

    return image