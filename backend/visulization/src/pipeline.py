import json
from src.config import OUTPUT_DIR
import pandas as pd
from src.preprocessing import (
    load_image,
    preprocess_image
)
from src.image_quality import (
    generate_quality_report
)
from src.feature_extraction import (
    extract_all_features,
    display_feature_summary
)
from src.visualization import (
    show_image,
    compare_images,
    plot_rgb_histogram,
    plot_intensity_histogram,
    show_edges
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)
# Inspection Pipeline
def run_pipeline(image_path):

    print("=" * 45)
    print(" VisionInspectAI Inspection Pipeline")
    print("=" * 45)

    # Load Original Image
    print("\nLoading image...")

    original = load_image(
        image_path
    )

    print("✓ Image loaded")

    # Preprocessing
    print("\nRunning preprocessing...")

    processed = preprocess_image(
        image_path
    )

    print("✓ Preprocessing completed")

    # Image Quality Analysis
    print("\nRunning image quality analysis...")

    quality = generate_quality_report(
        original
    )

    for key, value in quality.items():

        print(
            f"{key:<15}: {value:.2f}"
        )

    with open(
        OUTPUT_DIR / "quality_report.json",
        "w"
    ) as file:

        json.dump(
            quality,
            file,
            indent=4
        )

    print("✓ Quality report saved")

    # Feature Extraction
    print("\nExtracting features...")

    features = extract_all_features(
        original
    )

    display_feature_summary(
        original
    )

    # Save Feature Summary
    feature_summary = {
        "color_features": len(features["color"]),
        "texture_features": len(features["texture"]),
        "edge_density": features["edge_density"],
        "contours": features["shape"]["contour_count"],
        "contour_area": features["shape"]["total_contour_area"],
    }

    pd.DataFrame(
        [feature_summary]
    ).to_csv(
        OUTPUT_DIR / "feature_summary.csv",
        index=False
    )

    print("✓ Feature summary saved")

    # Generate Visualizations
    print("\nGenerating visualizations...")

    show_image(
        original,
        title="Original Image",
        save_path=OUTPUT_DIR / "original.png"
    )

    show_image(
        processed,
        title="Preprocessed Image",
        save_path=OUTPUT_DIR / "preprocessed.png"
    )

    compare_images(
        original,
        processed,
        save_path=OUTPUT_DIR / "comparison.png"
    )

    plot_rgb_histogram(
        original,
        save_path=OUTPUT_DIR / "rgb_histogram.png"
    )

    plot_intensity_histogram(
        original,
        save_path=OUTPUT_DIR / "grayscale_histogram.png"
    )

    show_edges(
        original,
        save_path=OUTPUT_DIR / "edge_detection.png"
    )

    print("✓ Visualizations saved")

    # Placeholder for Model
    print("\n----------------------------------------")
    print("Pipeline completed successfully.")
    print(f"Results saved to: {OUTPUT_DIR}")
    print("----------------------------------------")

    return {
        "quality_report": quality,
        "features": features,
        "output_directory": str(OUTPUT_DIR)
    }