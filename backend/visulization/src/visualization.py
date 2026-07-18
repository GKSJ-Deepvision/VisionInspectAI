import cv2
import matplotlib.pyplot as plt
from src.config import FIGURE_DPI

def save_plot(save_path, dpi=FIGURE_DPI):
    """
    Save the current matplotlib figure.
    """
    plt.tight_layout()
    plt.savefig(
        save_path,
        dpi=dpi,
        bbox_inches="tight"
    )
    plt.close()

def show_image(
    image,
    title="Image",
    save_path=None
):
    """
    Display an image with a title.
    """
    plt.figure(figsize=(5, 5))
    plt.imshow(image)
    plt.title(title)
    plt.axis("off")

    if save_path:
        save_plot(save_path)
    else:
        plt.tight_layout()
        plt.show()
        plt.close()

def compare_images(
    original,
    processed,
    title1="Original",
    title2="Processed",
    save_path=None
):
    """
    Display original and processed images side by side.
    """
    plt.figure(figsize=(10, 5))

    plt.subplot(1, 2, 1)
    plt.imshow(original)
    plt.title(title1)
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.imshow(processed)
    plt.title(title2)
    plt.axis("off")

    if save_path:
        save_plot(save_path)
    else:
        plt.tight_layout()
        plt.show()
        plt.close()

def plot_rgb_histogram(
    image,
    save_path=None
):
    """
    Plot RGB intensity histograms.
    """
    plt.figure(figsize=(7, 4))

    colors = ["red", "green", "blue"]

    for channel, color in enumerate(colors):

        histogram = cv2.calcHist(
            [image],
            [channel],
            None,
            [256],
            [0, 256]
        )

        plt.plot(
            histogram,
            color=color,
            label=color.capitalize()
        )

    plt.title("RGB Histogram")
    plt.xlabel("Pixel Intensity")
    plt.ylabel("Frequency")
    plt.legend()

    if save_path:
        save_plot(save_path)
    else:
        plt.tight_layout()
        plt.show()
        plt.close()

def plot_intensity_histogram(
    image,
    save_path=None
):
    """
    Plot grayscale intensity histogram.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    plt.figure(figsize=(7, 4))

    plt.hist(
        gray.ravel(),
        bins=256,
        range=(0, 256),
        color="black"
    )

    plt.title("Grayscale Intensity Histogram")
    plt.xlabel("Pixel Intensity")
    plt.ylabel("Frequency")

    if save_path:
        save_plot(save_path)
    else:
        plt.tight_layout()
        plt.show()
        plt.close()

def show_edges(
    image,
    low_threshold=100,
    high_threshold=200,
    save_path=None
):
    """
    Display edges using Canny Edge Detection.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    edges = cv2.Canny(
        gray,
        low_threshold,
        high_threshold
    )

    plt.figure(figsize=(5, 5))
    plt.imshow(edges, cmap="gray")
    plt.title("Canny Edge Detection")
    plt.axis("off")

    if save_path:
        save_plot(save_path)
    else:
        plt.tight_layout()
        plt.show()
        plt.close()