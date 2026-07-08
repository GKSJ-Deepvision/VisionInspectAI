import cv2
import os

def preprocess_image(image_path, processed_folder):

    # Read image
    image = cv2.imread(image_path)

    if image is None:
        return None

    # Original dimensions
    height, width, channels = image.shape

    # Resize image
    resized = cv2.resize(image, (256, 256))

    # Convert to Grayscale
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    # Remove noise using Gaussian Blur
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Save processed image
    filename = os.path.basename(image_path)
    processed_path = os.path.join(processed_folder, filename)

    cv2.imwrite(processed_path, blur)

    return {
        "height": height,
        "width": width,
        "channels": channels,
        "processed_path": processed_path
    }