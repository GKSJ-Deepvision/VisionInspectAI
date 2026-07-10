import numpy as np


class Normalize:

    def apply(self, image):

        image = image.astype(np.float32)

        image /= 255.0

        return image