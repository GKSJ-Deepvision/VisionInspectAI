""" anomiyal .py
VisionInspect AI - Trained Anomaly Detector

This module implements a KNN-based anomaly detection system trained on the MVTec AD dataset.
For each product category, it stores deep feature embeddings of "good" training images.
At inference time, it compares test images against these learned reference features to
determine whether a product is defective.
"""

import os
import math
import json
import numpy as np
from pathlib import Path
from datetime import datetime


class TrainedAnomalyDetector:
    """KNN-based anomaly detector trained on MVTec AD dataset.

    Stores per-category feature banks from "good" training images and uses
    K-nearest-neighbor distance as the anomaly score at inference time.
    """

    def __init__(self, model_dir=None):
        # Position-independent model directory resolution
        if model_dir is None:
            model_dir = "models/trained"

        # If relative path, resolve relative to the backend/ directory
        if not os.path.isabs(model_dir):
            this_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.abspath(os.path.join(this_dir, "..", ".."))
            resolved = os.path.join(backend_dir, model_dir)
            if os.path.exists(resolved) or not os.path.exists(model_dir):
                model_dir = resolved

        self.model_dir = model_dir
        self.feature_extractor = None  # Lazy-loaded to avoid slow startup
        self.category_features = {}    # {category_name: numpy array (N, 512)}
        self.category_thresholds = {}  # {category_name: float threshold}
        self.category_mean_dist = {}   # {category_name: float mean_distance}
        self.is_trained = False
        self.k_neighbors = 7           # Number of nearest neighbors for scoring

        # Global threshold for detecting truly unknown/out-of-distribution images
        self.unknown_distance_multiplier = 2.5  # If best distance > best_threshold * multiplier -> unknown

        # Attempt to load a previously trained model from disk
        self._load_model()

    def _ensure_extractor(self):
        """Lazy-load the deep feature extractor (downloads ResNet-18 weights on first use)."""
        if self.feature_extractor is None:
            from app.ml_engine.feature_extractor import DeepFeatureExtractor
            self.feature_extractor = DeepFeatureExtractor()

    def _clean_float(self, val, default=0.0):
        """Ensure float values are JSON compliant (no NaN or Infinity)."""
        try:
            val_float = float(val)
            if math.isnan(val_float) or math.isinf(val_float):
                return default
            return val_float
        except (TypeError, ValueError):
            return default

    def _sanitize_features(self, features):
        """Convert Tensors/lists to standard 2D NumPy float32 arrays (N, D)."""
        if hasattr(features, "detach"):
            features = features.detach().cpu().numpy()
        elif hasattr(features, "cpu"):
            features = features.cpu().numpy()
        
        features = np.asarray(features, dtype=np.float32)
        if features.ndim > 2:
            features = np.squeeze(features)
        if features.ndim == 1:
            features = features.reshape(1, -1)
        return features

    def train(self, dataset_path, categories=None):
        """Train the anomaly detector on MVTec AD dataset."""
        self._ensure_extractor()
        dataset_path = Path(dataset_path)

        if not dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")

        if categories is None:
            categories = sorted([
                d.name for d in dataset_path.iterdir()
                if d.is_dir() and not d.name.startswith('.')
                and d.name not in ('license.txt', 'readme.txt')
            ])

        print(f"\n{'='*60}")
        print(f"  Training anomaly detector on {len(categories)} categories")
        print(f"{'='*60}\n")

        for idx, category in enumerate(categories, 1):
            cat_dir = dataset_path / category
            train_good_dir = cat_dir / "train" / "good"

            if not train_good_dir.exists():
                print(f"  [{idx}/{len(categories)}] ⚠ Skipping {category}: no train/good directory")
                continue

            image_paths = sorted([
                str(p) for p in train_good_dir.iterdir()
                if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.bmp', '.tiff'}
            ])

            if not image_paths:
                print(f"  [{idx}/{len(categories)}] ⚠ Skipping {category}: no training images")
                continue

            print(f"  [{idx}/{len(categories)}] Training '{category}': {len(image_paths)} good images... ", end="", flush=True)

            start = datetime.now()
            raw_features = self.feature_extractor.extract_batch(image_paths, batch_size=16)
            elapsed = (datetime.now() - start).total_seconds()

            if len(raw_features) == 0:
                print("FAILED (no features extracted)")
                continue

            features = self._sanitize_features(raw_features)
            self.category_features[category] = features

            # Handle edge case where category has fewer than 2 images
            if len(features) < 2:
                self.category_thresholds[category] = 0.5
                self.category_mean_dist[category] = 0.0
                print(f"OK ({elapsed:.1f}s, fallback threshold=0.5000)")
                continue

            # Compute anomaly threshold using leave-one-out cross-validation
            loo_distances = []
            for i in range(len(features)):
                others = np.delete(features, i, axis=0)
                dists = np.linalg.norm(others - features[i], axis=1)
                dists.sort()
                k = min(self.k_neighbors, len(dists))
                avg_knn_dist = float(np.mean(dists[:k]))
                loo_distances.append(avg_knn_dist)

            loo_distances = np.array(loo_distances)
            mean_dist = float(np.mean(loo_distances))
            std_dist = float(np.std(loo_distances))
            max_dist = float(np.max(loo_distances))
            p95_dist = float(np.percentile(loo_distances, 95))

            stat_threshold = mean_dist + 2.0 * std_dist
            pct_threshold = p95_dist + 1.0 * std_dist
            threshold = max(stat_threshold, pct_threshold)
            threshold = max(threshold, 0.05)

            self.category_thresholds[category] = threshold
            self.category_mean_dist[category] = mean_dist

            print(f"OK ({elapsed:.1f}s, threshold={threshold:.4f}, mean_dist={mean_dist:.4f}, std={std_dist:.4f}, max={max_dist:.4f})")

        self.is_trained = len(self.category_features) > 0
        self._save_model()

        print(f"\n{'='*60}")
        print(f"  Training complete! {len(self.category_features)} categories trained.")
        print(f"  Model saved to: {os.path.abspath(self.model_dir)}")
        print(f"{'='*60}\n")

    def predict(self, image_input):
        """Predict whether an image contains a defect."""
        if not self.is_trained:
            return {
                "is_defective": False,
                "classification": "Untrained",
                "matched_category": "untrained_model",
                "anomaly_score": 0.0,
                "threshold": 0.0,
                "confidence": 0.0,
                "distance_ratio": 0.0,
                "is_unknown": True,
                "error": "Model is not trained. Please train the detector first."
            }

        try:
            self._ensure_extractor()
            raw_test_features = self.feature_extractor.extract(image_input)
            test_features = self._sanitize_features(raw_test_features)
        except Exception as e:
            return {
                "is_defective": True,
                "classification": "Error",
                "matched_category": "error",
                "anomaly_score": 0.0,
                "threshold": 0.0,
                "confidence": 0.0,
                "distance_ratio": 0.0,
                "is_unknown": True,
                "error": f"Feature extraction failed: {str(e)}"
            }

        best_category = None
        best_knn_distance = float('inf')
        best_threshold = 0.5

        for category, ref_features in self.category_features.items():
            if len(ref_features) == 0:
                continue
            distances = np.linalg.norm(ref_features - test_features, axis=1)
            distances.sort()

            k = min(self.k_neighbors, len(distances))
            if k == 0:
                continue
            avg_knn_dist = float(np.mean(distances[:k]))

            if avg_knn_dist < best_knn_distance:
                best_knn_distance = avg_knn_dist
                best_category = category
                best_threshold = self.category_thresholds.get(category, 0.5)

        if best_category is None or math.isinf(best_knn_distance):
            return {
                "is_defective": True,
                "classification": "Error",
                "matched_category": "error",
                "anomaly_score": 0.0,
                "threshold": 0.0,
                "confidence": 0.0,
                "distance_ratio": 0.0,
                "is_unknown": True,
                "error": "No valid category features found for comparison."
            }

        best_threshold = max(best_threshold, 1e-6)
        is_unknown = best_knn_distance > (best_threshold * self.unknown_distance_multiplier)

        if is_unknown:
            max_threshold = max(self.category_thresholds.values()) if self.category_thresholds else 0.5
            max_threshold = max(max_threshold, 1e-6)
            margin = 1.5
            is_defective_for_unknown = best_knn_distance > (best_threshold * margin)

            if is_defective_for_unknown:
                confidence = min(0.75, 0.50 + (best_knn_distance / (max_threshold * 5.0)) * 0.25)
                classification = "Anomaly (Unknown Product)"
            else:
                confidence = 0.60
                classification = "Normal (Unknown Product)"

            return {
                "is_defective": bool(is_defective_for_unknown),
                "classification": classification,
                "matched_category": f"unknown_product (nearest: {best_category})",
                "anomaly_score": round(self._clean_float(best_knn_distance), 6),
                "threshold": round(self._clean_float(best_threshold), 6),
                "confidence": round(self._clean_float(confidence), 4),
                "distance_ratio": round(self._clean_float(best_knn_distance / best_threshold), 4),
                "is_unknown": True,
            }
        margin = 1.15
        is_defective = best_knn_distance > (best_threshold * margin)
        ratio = best_knn_distance / best_threshold

        if is_defective:
            confidence = min(0.99, 0.55 + min(0.44, (ratio - 1.0) * 0.5))
            classification = "Defective"
        else:
            confidence = min(0.99, 0.70 + min(0.29, (1.1 - ratio) * 0.4))
            classification = "Normal"
 

        return {
            "is_defective": bool(is_defective),
            "classification": classification,
            "matched_category": best_category,
            "anomaly_score": round(self._clean_float(best_knn_distance), 6),
            "threshold": round(self._clean_float(best_threshold), 6),
            "confidence": round(self._clean_float(max(0.55, confidence)), 4),
            "distance_ratio": round(self._clean_float(ratio), 4),
            "is_unknown": False,
        }

    def evaluate(self, dataset_path, categories=None):
        """Evaluate model accuracy on the MVTec AD test set."""
        if not self.is_trained:
            print("Model not trained! Run train() first.")
            return None

        self._ensure_extractor()
        dataset_path = Path(dataset_path)

        if categories is None:
            categories = list(self.category_features.keys())

        print(f"\n{'='*60}")
        print(f"  Evaluating on {len(categories)} categories")
        print(f"{'='*60}\n")

        results = {}
        total_correct = 0
        total_images = 0

        for category in categories:
            test_dir = dataset_path / category / "test"
            if not test_dir.exists():
                print(f"  ⚠ Skipping {category}: no test directory")
                continue

            tp = fp = tn = fn = 0

            for defect_dir in sorted(test_dir.iterdir()):
                if not defect_dir.is_dir():
                    continue

                is_good_folder = defect_dir.name == "good"
                image_paths = sorted([
                    str(p) for p in defect_dir.iterdir()
                    if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.bmp'}
                ])

                for img_path in image_paths:
                    pred = self.predict(img_path)
                    if pred is None or pred.get("error"):
                        continue

                    predicted_defective = pred["is_defective"]
                    actual_defective = not is_good_folder

                    if predicted_defective and actual_defective:
                        tp += 1
                    elif predicted_defective and not actual_defective:
                        fp += 1
                    elif not predicted_defective and not actual_defective:
                        tn += 1
                    else:
                        fn += 1

            total = tp + fp + tn + fn
            correct = tp + tn
            accuracy = correct / max(total, 1)
            precision = tp / max(tp + fp, 1)
            recall = tp / max(tp + fn, 1)
            f1 = 2 * precision * recall / max(precision + recall, 1e-8)

            results[category] = {
                "accuracy": round(accuracy, 4),
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1_score": round(f1, 4),
                "total": total,
                "correct": correct,
                "true_positives": tp,
                "false_positives": fp,
                "true_negatives": tn,
                "false_negatives": fn,
            }

            total_correct += correct
            total_images += total

            print(f"  {category:15s}: Acc={accuracy*100:5.1f}%  P={precision*100:5.1f}%  R={recall*100:5.1f}%  F1={f1*100:5.1f}%  (TP={tp} FP={fp} TN={tn} FN={fn})")

        overall_accuracy = total_correct / max(total_images, 1)

        print(f"\n{'='*60}")
        print(f"  Overall Accuracy: {overall_accuracy*100:.1f}% ({total_correct}/{total_images})")
        print(f"{'='*60}\n")

        return {
            "overall_accuracy": round(overall_accuracy, 4),
            "total_images": total_images,
            "total_correct": total_correct,
            "per_category": results,
        }

    def _save_model(self):
        """Save trained model (feature banks + thresholds) to disk."""
        os.makedirs(self.model_dir, exist_ok=True)

        for category, features in self.category_features.items():
            feat_path = os.path.join(self.model_dir, f"{category}_features.npy")
            np.save(feat_path, features)

        metadata = {
            "categories": list(self.category_features.keys()),
            "thresholds": self.category_thresholds,
            "mean_distances": self.category_mean_dist,
            "k_neighbors": self.k_neighbors,
            "unknown_distance_multiplier": self.unknown_distance_multiplier,
            "is_trained": True,
            "feature_dim": 512,
            "trained_at": datetime.now().isoformat(),
        }
        metadata_path = os.path.join(self.model_dir, "metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

    def _load_model(self):
        """Load a previously trained model from disk."""
        metadata_path = os.path.join(self.model_dir, "metadata.json")

        if not os.path.exists(metadata_path):
            return

        try:
            with open(metadata_path, "r") as f:
                metadata = json.load(f)

            self.category_thresholds = {k: float(v) for k, v in metadata.get("thresholds", {}).items()}
            self.category_mean_dist = {k: float(v) for k, v in metadata.get("mean_distances", {}).items()}
            self.k_neighbors = metadata.get("k_neighbors", 3)
            self.unknown_distance_multiplier = metadata.get("unknown_distance_multiplier", 2.5)

            loaded_count = 0
            for category in metadata.get("categories", []):
                feat_path = os.path.join(self.model_dir, f"{category}_features.npy")
                if os.path.exists(feat_path):
                    self.category_features[category] = np.load(feat_path)
                    loaded_count += 1

            if loaded_count > 0:
                self.is_trained = True
                print(f"✅ Loaded trained anomaly model: {loaded_count} categories from {self.model_dir}")
            else:
                print(f"⚠ Model metadata found but no feature files in {self.model_dir}")

        except Exception as e:
            print(f"⚠ Could not load trained model: {e}")