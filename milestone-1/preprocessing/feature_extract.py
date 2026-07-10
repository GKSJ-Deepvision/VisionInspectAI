import cv2


class FeatureExtractor:

    def extract_edges(self, image):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        edges = cv2.Canny(
            gray,
            100,
            200
        )

        return edges


    def extract_corners(self, image):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        gray = gray.astype("float32")

        corners = cv2.cornerHarris(
            gray,
            2,
            3,
            0.04
        )

        return corners