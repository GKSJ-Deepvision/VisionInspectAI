import cv2
import matplotlib.pyplot as plt

def show_image(image, title="Image"):
    """
    Display an image with a title.
    """
    plt.figure(figsize=(5, 5))
    plt.imshow(image)
    plt.title(title)
    plt.axis("off")
    plt.tight_layout()
    plt.show()

def compare_images(original, preprocessed,
                   title1="Original",
                   title2="Processed"):
    """
    Displays the orginal and preprocessed images side by side.
    """
    plt.figure(figsize=(10,5))

    plt.subplot(1,2,1)
    plt.imshow(original)
    plt.title(title1)
    plt.axis("off")

    plt.subplot(1,2,2)
    plt.imshow(preprocessed)
    plt.title(title2)
    plt.axis("off")

    plt.tight_layout()
    plt.show()

# RGB Histogram
def plot_rgb_histogram(image):
    """
    Plot RGB intensity histograms.
    """
    plt.figure(figsize=(7,4))

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
        plt.tight_layout()
        plt.show()


def plot_intensity_histogram(image):
    """
    Plot grayscale intensity histogram.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2BGR
    )
    plt.figure(figsize=(7,4))

    plt.hist(
        gray.ravel(),
        bins=256,
        range=(0, 256),
        color="black"
    )

    plt.title("Grayscale Intensity Histogram")
    plt.xlabel("Pixel Intensity")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.show()    

def show_edges(image, low_threshold=100, high_threshold=200):
    """
    Diplay edges using Canny Edge Detection.
    """
    gray = cv2.cvtColor(
        image, cv2.COLOR_RGB2GRAY
    )

    edges = cv2.Canny(
        gray,
        low_threshold,
        high_threshold
    )

    plt.figure(figsize=(5,5))
    plt.imshow(edges, cmap="gray")
    plt.title("Canny Egde Detectio")
    plt.axis("off")
    plt.tight_layout()
    plt.show()

def save_figure(filename, dpi=300):
    """
    Save the current matplotlib figure
    """
    plt.tight_layout()
    plt.savefig(
        filename,
        dpi=dpi,
        box_inches="tight"
    )
    plt.close()