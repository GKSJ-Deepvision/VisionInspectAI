import os
import cv2

from utils import get_image_paths
from utils import create_output_path
from utils import read_image

from resize import Resize
from denoise import Denoise
from enhance import Enhance
from normalize import Normalize

from report import ReportGenerator


DATASET_PATH = "dataset/mvtec_anomaly_detection"

OUTPUT_PATH = "output"

REPORT_PATH = "reports/preprocessing_report.csv"


resize = Resize(256,256)

denoise = Denoise()

enhance = Enhance()

normalize = Normalize()

report = ReportGenerator()


image_paths = get_image_paths(DATASET_PATH)

print(f"Total Images Found : {len(image_paths)}")


for path in image_paths:

    image = read_image(path)

    original_shape = image.shape

    image = resize.apply(image)

    image = denoise.apply(image)

    image = enhance.apply(image)

    image = normalize.apply(image)

    save_path = create_output_path(
        path,
        DATASET_PATH,
        OUTPUT_PATH
    )

    cv2.imwrite(
        save_path,
        (image * 255).astype("uint8")
    )

    category = path.split(os.sep)[2]

    report.add_record(
        category,
        os.path.basename(path),
        original_shape,
        image.shape
    )


report.save(REPORT_PATH)

print("\nPreprocessing Completed Successfully.")