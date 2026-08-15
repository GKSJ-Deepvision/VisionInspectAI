from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def default_demo_image() -> Path:
    """Return a real MVTec bottle image for command-line demonstration."""
    candidates = [
        PROJECT_ROOT / "data" / "raw" / "mvtec_anomaly_detection" / "bottle" / "test" / "contamination",
        PROJECT_ROOT / "data" / "raw" / "mvtec_anomaly_detection" / "bottle" / "test" / "broken_large",
        PROJECT_ROOT / "data" / "raw" / "mvtec_anomaly_detection" / "bottle" / "test" / "broken_small",
        PROJECT_ROOT / "data" / "raw" / "mvtec_anomaly_detection" / "bottle" / "test" / "good",
    ]
    for directory in candidates:
        image_paths = sorted(directory.glob("*.png"))
        if image_paths:
            return image_paths[0]
    raise FileNotFoundError("No MVTec bottle test image found under data/raw.")


def build_inference_config(category: str):
    """Use the application settings when available, otherwise build a standalone ML configuration."""
    try:
        from app.services.prediction_service import build_inference_config as build_backend_config
    except ModuleNotFoundError as exc:
        if exc.name and not exc.name.startswith("app"):
            raise
    else:
        return build_backend_config(category)

    from ml.inference import InferenceConfig
    from ml.model_registry import category_model_spec, is_valid_checkpoint

    spec = category_model_spec(category)
    if not spec.is_runnable:
        raise RuntimeError(f"Portable runtime artifacts are unavailable for category: {spec.category}")

    use_advanced = os.getenv("USE_PADIM_INFERENCE", "false").lower() in {"1", "true", "yes"}
    use_openvino = os.getenv("USE_OPENVINO_INFERENCE", "false").lower() in {"1", "true", "yes"}
    openvino_available = bool(
        spec.openvino_path
        and spec.openvino_path.exists()
        and spec.openvino_path.with_suffix(".bin").exists()
    )

    return InferenceConfig(
        category=spec.category,
        anomaly_model_kind=spec.model_kind,
        use_padim_inference=use_advanced and (is_valid_checkpoint(spec.checkpoint_path) or openvino_available),
        padim_inference_accelerator=os.getenv("PADIM_INFERENCE_ACCELERATOR", "auto"),
        model_checkpoint_path=spec.checkpoint_path,
        classifier_model_path=spec.classifier_path,
        cnn_classifier_model_path=spec.cnn_classifier_path,
        model_metadata_path=spec.metadata_path,
        baseline_profile_path=spec.baseline_profile_path,
        baseline_threshold=spec.baseline_score_threshold,
        baseline_residual_threshold=spec.baseline_residual_threshold,
        padim_score_threshold=spec.padim_score_threshold,
        review_severity_threshold=40.0,
        fail_severity_threshold=60.0,
        use_openvino_inference=use_openvino and openvino_available,
        openvino_inference_device=os.getenv("OPENVINO_INFERENCE_DEVICE", "CPU"),
        openvino_path=spec.openvino_path if use_openvino and openvino_available else None,
        openvino_calibrator_path=spec.openvino_calibrator_path if use_openvino and openvino_available else None,
        compact_classifier_path=spec.compact_classifier_path,
    )


def inspect_image(image_path: str | Path | None = None, category: str = "bottle") -> dict:
    """Run the backend-compatible AI pipeline without creating external output files."""
    from ml.inference import inspect_image as inspect_image_runtime

    selected_image = Path(image_path) if image_path else default_demo_image()
    config = build_inference_config(category)
    result = inspect_image_runtime(selected_image, config)
    return {
        "input_image": str(selected_image),
        "category": result.get("model_category", category),
        "prediction": result["prediction"],
        "defect_type": result["defect_type"],
        "confidence": result["confidence"],
        "anomaly_score": result["anomaly_score"],
        "defect_area_ratio": result["defect_area_ratio"],
        "heatmap_path": "inline:not_saved_by_cli",
        "processed_image_path": "inline:not_saved_by_cli",
        "severity_score": result["severity_score"],
        "severity_level": result["severity_level"],
        "pass_fail": result["pass_fail"],
        "recommended_action": result["recommended_action"],
        "model_used": result["model_used"],
        "active_inference_engine": result["active_inference_engine"],
        "fallback_used": result["fallback_used"],
        "fallback_reason": result["fallback_reason"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run VisionInspect AI inference on one image.")
    parser.add_argument("--image", type=str, default=None, help="Path to an input product image.")
    parser.add_argument("--category", default="bottle", help="MVTec product category for category-specific inference.")
    parser.add_argument(
        "--use-padim",
        action="store_true",
        help="Force PaDiM checkpoint inference for this run.",
    )
    parser.add_argument(
        "--use-baseline",
        action="store_true",
        help="Force OpenCV baseline inference for this run.",
    )
    args = parser.parse_args()

    if args.use_padim and args.use_baseline:
        raise SystemExit("Choose only one: --use-padim or --use-baseline.")
    if args.use_padim:
        os.environ["USE_PADIM_INFERENCE"] = "true"
    if args.use_baseline:
        os.environ["USE_PADIM_INFERENCE"] = "false"

    print(json.dumps(inspect_image(args.image, args.category), indent=2))


if __name__ == "__main__":
    main()
