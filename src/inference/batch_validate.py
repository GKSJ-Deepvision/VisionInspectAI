
import csv
import os
from datetime import datetime

from predict import predict_image

# --------------------------------------------------------------------------
DATASET_ROOT = r"D:\Internship_Project\VisionInspectAI\dataset\mvtec_anomaly_detection"
OUTPUT_CSV = r"D:\Internship_Project\VisionInspectAI\src\batch_validation_results.csv"

ALL_CATEGORIES = [
    "bottle", "cable", "capsule", "carpet", "grid",
    "hazelnut", "leather", "metal_nut", "pill", "screw",
    "tile", "toothbrush", "transistor", "wood", "zipper",
]


def find_sample_images(category: str):
    """Return (good_image_path, defect_image_path, defect_folder_name)."""
    test_dir = os.path.join(DATASET_ROOT, category, "test")
    if not os.path.isdir(test_dir):
        raise FileNotFoundError(f"No test folder for category '{category}' at {test_dir}")

    subfolders = sorted(os.listdir(test_dir))

    good_dir = os.path.join(test_dir, "good")
    good_files = sorted(os.listdir(good_dir)) if os.path.isdir(good_dir) else []
    if not good_files:
        raise FileNotFoundError(f"No images found in {good_dir}")
    good_image = os.path.join(good_dir, good_files[0])

    defect_folders = [f for f in subfolders if f != "good"]
    if not defect_folders:
        raise FileNotFoundError(f"No defect subfolders found under {test_dir}")
    defect_folder = defect_folders[0]
    defect_dir = os.path.join(test_dir, defect_folder)
    defect_files = sorted(os.listdir(defect_dir))
    if not defect_files:
        raise FileNotFoundError(f"No images found in {defect_dir}")
    defect_image = os.path.join(defect_dir, defect_files[0])

    return good_image, defect_image, defect_folder


def main():
    print("VisionInspect AI - Batch Validation Across All 15 Categories")
    print(f"Started at {datetime.now().isoformat()}\n")

    results = []

    for category in ALL_CATEGORIES:
        print(f"\n{'='*60}")
        print(f"Category: {category}")
        print(f"{'='*60}")

        try:
            good_image, defect_image, defect_folder = find_sample_images(category)
        except FileNotFoundError as e:
            print(f"[SKIP] {e}")
            results.append({
                "category": category, "good_correct": "SKIPPED", "defect_correct": "SKIPPED",
                "good_score": "", "defect_score": "", "defect_type": "", "error": str(e),
            })
            continue

        row = {"category": category, "defect_type": defect_folder, "error": ""}

        # --- Good (normal) image ---
        try:
            good_result = predict_image(category, good_image, save_heatmap=False)
            row["good_pred"] = good_result["pred_label"]
            row["good_score"] = good_result["pred_score"]
            row["good_correct"] = "YES" if good_result["pred_label"] == "Normal" else "NO"
        except Exception as e:
            row["good_pred"] = "ERROR"
            row["good_score"] = ""
            row["good_correct"] = "ERROR"
            row["error"] += f"good: {e}; "

        # --- Defective image ---
        try:
            defect_result = predict_image(category, defect_image, save_heatmap=False)
            row["defect_pred"] = defect_result["pred_label"]
            row["defect_score"] = defect_result["pred_score"]
            row["defect_correct"] = "YES" if defect_result["pred_label"] == "Defective" else "NO"
        except Exception as e:
            row["defect_pred"] = "ERROR"
            row["defect_score"] = ""
            row["defect_correct"] = "ERROR"
            row["error"] += f"defect: {e}; "

        results.append(row)

        print(f"  good ({os.path.basename(good_image)}):    "
              f"{row.get('good_pred')} (score={row.get('good_score')}) "
              f"-> {row.get('good_correct')}")
        print(f"  defect ({defect_folder}/{os.path.basename(defect_image)}): "
              f"{row.get('defect_pred')} (score={row.get('defect_score')}) "
              f"-> {row.get('defect_correct')}")

    # --- Save CSV ---
    fieldnames = ["category", "defect_type", "good_pred", "good_score", "good_correct",
                  "defect_pred", "defect_score", "defect_correct", "error"]
    with open(OUTPUT_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in results:
            writer.writerow({k: row.get(k, "") for k in fieldnames})

    # --- Summary ---
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    total_checks = 0
    correct_checks = 0
    for row in results:
        for key in ("good_correct", "defect_correct"):
            val = row.get(key)
            if val in ("YES", "NO"):
                total_checks += 1
                if val == "YES":
                    correct_checks += 1

    print(f"Correct: {correct_checks} / {total_checks}")
    print(f"Results saved to: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
