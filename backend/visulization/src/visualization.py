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