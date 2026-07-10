import cv2


class Resize:

    def __init__(self, width=256, height=256):
        self.width = width
        self.height = height

    def apply(self, image):
        return cv2.resize(
            image,
            (self.width, self.height),
            interpolation=cv2.INTER_AREA
        )