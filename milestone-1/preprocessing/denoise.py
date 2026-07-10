import cv2


class Denoise:

    def __init__(self, method="bilateral"):
        self.method = method

    def apply(self, image):

        if self.method == "gaussian":
            return cv2.GaussianBlur(
                image,
                (5, 5),
                0
            )

        elif self.method == "median":
            return cv2.medianBlur(
                image,
                5
            )

        elif self.method == "bilateral":
            return cv2.bilateralFilter(
                image,
                9,
                75,
                75
            )

        return image