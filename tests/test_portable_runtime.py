from pathlib import Path

import joblib

from ml.baseline_detector import load_reference_profile
from ml.model_registry import (
    SUPPORTED_CATEGORIES,
    CategoryModelSpec,
    category_model_spec,
    category_model_statuses,
)


def portable_spec(tmp_path: Path) -> CategoryModelSpec:
    profile = tmp_path / "normal_profile.npz"
    metadata = tmp_path / "model_metadata.json"
    classifier = tmp_path / "defect_classifier.pkl"
    profile.touch()
    metadata.write_text("{}", encoding="utf-8")
    classifier.touch()
    return CategoryModelSpec(
        category="bottle",
        model_kind="padim",
        checkpoint_path=tmp_path / "missing.ckpt",
        classifier_path=classifier,
        baseline_profile_path=profile,
        metadata_path=metadata,
    )


def test_compact_artifacts_are_runnable_without_advanced_checkpoint(tmp_path):
    spec = portable_spec(tmp_path)

    assert spec.is_runnable is True
    assert spec.has_advanced_model is False
    assert spec.is_trained is False


def test_every_supported_category_has_portable_runtime_artifacts():
    statuses = category_model_statuses()

    assert {item["category"] for item in statuses} == set(SUPPORTED_CATEGORIES)
    assert all(item["available"] for item in statuses)
    assert all(item["classification_trained"] for item in statuses)
    assert all(
        len(item["artifacts"][artifact]["sha256"]) == 64
        for item in statuses
        for artifact in ("profile", "classifier", "metadata")
    )

    for category in SUPPORTED_CATEGORIES:
        spec = category_model_spec(category)
        profile = load_reference_profile(spec.baseline_profile_path)
        classifier = joblib.load(spec.classifier_path)
        assert profile["mean"].shape == profile["std"].shape == profile["foreground_mask"].shape
        assert profile["embedding_bank"].ndim == 2
        assert profile["embedding_bank"].shape[1] == 512
        assert "classifier" in classifier
        assert classifier["defect_only"] is True
        assert "good" not in classifier["labels"]


def test_shared_onnx_feature_model_is_github_safe():
    model_path = Path("models/inference/resnet18_features.onnx")
    pytorch_weights_path = Path("models/inference/resnet18-f37072fd.pth")

    assert model_path.exists()
    assert 1_000_000 < model_path.stat().st_size < 100_000_000
    assert not pytorch_weights_path.exists()


def test_promoted_cnn_classifiers_are_portable_onnx_artifacts():
    for category in ("capsule", "wood"):
        spec = category_model_spec(category)

        assert spec.cnn_classifier_path is not None
        assert spec.cnn_classifier_path.exists()
        assert 1_000_000 < spec.cnn_classifier_path.stat().st_size < 100_000_000
        assert spec.cnn_classifier_path.with_suffix(".json").exists()
        assert not spec.cnn_classifier_path.with_suffix(".pt").exists()
