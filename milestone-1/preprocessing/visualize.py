import os
import cv2
import matplotlib.pyplot as plt

from preprocessing.resize import Resize
from preprocessing.denoise import Denoise
from preprocessing.enhance import Enhance
from preprocessing.feature_extract import FeatureExtractor


class Visualizer:

    def __init__(self):

        self.resize = Resize(256, 256)
        self.denoise = Denoise()
        self.enhance = Enhance()
        self.extractor = FeatureExtractor()

    def visualize(self, image_path):

        # Read image
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(f"Unable to read image: {image_path}")

        # Original Image
        original = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Resize
        resized = self.resize.apply(image)

        # Noise Removal
        denoised = self.denoise.apply(resized)

        # Image Enhancement
        enhanced = self.enhance.apply(denoised)

        # Feature Extraction
        edges = self.extractor.extract_edges(enhanced)

        # Create Figure
        plt.figure(figsize=(18, 5))

        # Original
        plt.subplot(1, 5, 1)
        plt.imshow(original)
        plt.title("Original")
        plt.axis("off")

        # Resized
        plt.subplot(1, 5, 2)
        plt.imshow(cv2.cvtColor(resized, cv2.COLOR_BGR2RGB))
        plt.title("Resized")
        plt.axis("off")

        # Denoised
        plt.subplot(1, 5, 3)
        plt.imshow(cv2.cvtColor(denoised, cv2.COLOR_BGR2RGB))
        plt.title("Denoised")
        plt.axis("off")

        # Enhanced
        plt.subplot(1, 5, 4)
        plt.imshow(cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB))
        plt.title("Enhanced")
        plt.axis("off")

        # Edge Detection
        plt.subplot(1, 5, 5)
        plt.imshow(edges, cmap="gray")
        plt.title("Edges")
        plt.axis("off")

        plt.tight_layout()

        # Create results folder
        os.makedirs("results", exist_ok=True)

        # Save figure
        output_path = "results/sample_pipeline.png"

        plt.savefig(output_path, dpi=300)

        print("\nVisualization Saved Successfully!")
        print(f"Saved at : {output_path}")

        plt.show()