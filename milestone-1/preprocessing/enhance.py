import cv2


class Enhance:

    def __init__(self):

        self.clahe = cv2.createCLAHE(
            clipLimit=2.0,
            tileGridSize=(8, 8)
        )

    def apply(self, image):

        lab = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2LAB
        )

        l, a, b = cv2.split(lab)

        l = self.clahe.apply(l)

        enhanced = cv2.merge(
            (l, a, b)
        )

        enhanced = cv2.cvtColor(
            enhanced,
            cv2.COLOR_LAB2BGR
        )

        return enhanced