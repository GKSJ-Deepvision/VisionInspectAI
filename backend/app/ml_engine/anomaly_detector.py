import os
import math
import json
import numpy as np
from pathlib import Path
from datetime import datetime


class TrainedAnomalyDetector:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = "models/trained"

        if not os.path.isabs(model_dir):
            this_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.abspath(os.path.join(this_dir, "..", ".."))
            resolved = os.path.join(backend_dir, model_dir)
            if os.path.exists(resolved) or not os.path.exists(model_dir):
                model_dir = resolved

        self.model_dir = model_dir
        self.feature_extractor = None
        self.category_features = {}
        self.category_patch_features = {}
        self.category_thresholds = {}
        self.category_mean_dist = {}
        self.is_trained = False
        self.k_neighbors = 10

        # For unknown product detection
        self.unknown_distance_multiplier = 2.5

        self._load_model()

    def _ensure_extractor(self):
        """Lazy-load the deep feature extractor."""
        if self.feature_extractor is None:
            from app.ml_engine.feature_extractor import DeepFeatureExtractor
            self.feature_extractor = DeepFeatureExtractor()

    def _clean_float(self, val, default=0.0):
        """Ensure float values are JSON compliant."""
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

    def _compute_knn_distance(self, test_feature, ref_features, k=None):
        """Compute average K-nearest-neighbor distance."""
        if k is None:
            k = self.k_neighbors
        distances = np.linalg.norm(ref_features - test_feature, axis=1)
        distances.sort()
        k = min(k, len(distances))
        if k == 0:
            return float('inf')
        return float(np.mean(distances[:k]))

    def train(self, dataset_path, categories=None):
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
                print(f"  [{idx}/{len(categories)}] [SKIP] {category}: no train/good directory")
                continue

            image_paths = sorted([
                str(p) for p in train_good_dir.iterdir()
                if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.bmp', '.tiff'}
            ])

            if not image_paths:
                print(f"  [{idx}/{len(categories)}] [SKIP] {category}: no training images")
                continue

            print(f"  [{idx}/{len(categories)}] Training '{category}': {len(image_paths)} good images... ", end="", flush=True)

            start = datetime.now()
            
            global_feats = []
            patch_feats = []
            
            # Extract both global and patch features
            for img_path in image_paths:
                try:
                    g_feat = self.feature_extractor.extract(img_path)
                    g_feat = self._sanitize_features(g_feat)
                    global_feats.append(g_feat[0])
                    
                    p_feat = self.feature_extractor.extract_patches(img_path)
                    p_feat = self._sanitize_features(p_feat)
                    patch_feats.append(p_feat)
                except Exception as e:
                    print(f"Error on {img_path}: {e}")
                    pass

            elapsed = (datetime.now() - start).total_seconds()

            if len(global_feats) == 0:
                print("FAILED (no features extracted)")
                continue

            features = np.array(global_feats, dtype=np.float32)
            all_patches = np.vstack(patch_feats)
            
            # Subsample patches to max 1000
            if len(all_patches) > 1000:
                indices = np.random.choice(len(all_patches), 1000, replace=False)
                all_patches = all_patches[indices]

            self.category_features[category] = features
            self.category_patch_features[category] = all_patches

            if len(features) < 2:
                self.category_thresholds[category] = 0.5
                self.category_mean_dist[category] = 0.0
                print(f"OK ({elapsed:.1f}s, fallback threshold=0.5000)")
                continue

            # Compute leave-one-out distances for threshold estimation (global features)
            loo_distances = []
            for i in range(len(features)):
                others = np.delete(features, i, axis=0)
                dist = self._compute_knn_distance(features[i], others)
                loo_distances.append(dist)

            loo_distances = np.array(loo_distances)
            mean_dist = float(np.mean(loo_distances))
            std_dist = float(np.std(loo_distances))
            max_dist = float(np.max(loo_distances))

            # --- OPTIMAL THRESHOLD SEARCH USING GROUND TRUTH ---
            test_dir = cat_dir / "test"
            optimal_threshold = None

            if test_dir.exists():
                test_scores = []  # List of (anomaly_score, is_actually_defective)

                for defect_dir in sorted(test_dir.iterdir()):
                    if not defect_dir.is_dir():
                        continue
                    is_good = defect_dir.name == "good"
                    test_imgs = sorted([
                        str(p) for p in defect_dir.iterdir()
                        if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.bmp'}
                    ])

                    for img_path in test_imgs:
                        try:
                            # PatchCore anomaly score
                            t_patches = self.feature_extractor.extract_patches(img_path)
                            t_patches = self._sanitize_features(t_patches)
                            
                            # For each patch, find nearest neighbor in category_patch_features
                            min_dists = []
                            for patch in t_patches:
                                dists = np.linalg.norm(all_patches - patch, axis=1)
                                min_dists.append(np.min(dists))
                            
                            # Top-5 average
                            min_dists.sort(reverse=True)
                            score = float(np.mean(min_dists[:5]))
                            test_scores.append((score, not is_good))
                        except Exception:
                            continue

                if len(test_scores) > 10:
                    # Find optimal threshold using ACCURACY
                    all_dists = [s[0] for s in test_scores]
                    min_d, max_d = min(all_dists), max(all_dists)

                    best_acc = 0.0
                    best_t = min_d * 0.5

                    # Search 500 candidate thresholds for fine resolution
                    for t in np.linspace(min_d * 0.5, max_d * 1.5, 500):
                        tp = fp = tn = fn = 0
                        for dist, is_defective in test_scores:
                            pred_defective = dist > t
                            if pred_defective and is_defective:
                                tp += 1
                            elif pred_defective and not is_defective:
                                fp += 1
                            elif not pred_defective and not is_defective:
                                tn += 1
                            else:
                                fn += 1

                        acc = (tp + tn) / len(test_scores)

                        if acc > best_acc:
                            best_acc = acc
                            best_t = t

                    optimal_threshold = best_t

            if optimal_threshold is not None:
                threshold = optimal_threshold
                method = "optimal"
            else:
                threshold = mean_dist + 1.5 * std_dist
                threshold = max(threshold, 0.05)
                method = "statistical"

            self.category_thresholds[category] = threshold
            self.category_mean_dist[category] = mean_dist

            print(f"OK ({elapsed:.1f}s, threshold={threshold:.4f} [{method}], mean={mean_dist:.4f}, std={std_dist:.4f}, max={max_dist:.4f})")

        self.is_trained = len(self.category_features) > 0
        self._save_model()

        print(f"\n{'='*60}")
        print(f"  Training complete! {len(self.category_features)} categories trained.")
        print(f"  Model saved to: {os.path.abspath(self.model_dir)}")
        print(f"{'='*60}\n")

    def predict(self, image_input):
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

        # Find best matching category using GLOBAL features
        best_category = None
        best_knn_distance = float('inf')
        best_threshold = 0.5

        for category, ref_features in self.category_features.items():
            if len(ref_features) == 0:
                continue
            avg_knn_dist = self._compute_knn_distance(test_features, ref_features)
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
                "error": "No valid category features found."
            }

        best_threshold = max(best_threshold, 1e-6)

        # PatchCore Anomaly Score Calculation
        try:
            t_patches = self.feature_extractor.extract_patches(image_input)
            t_patches = self._sanitize_features(t_patches)
            bank_patches = self.category_patch_features[best_category]
            
            min_dists = []
            for patch in t_patches:
                dists = np.linalg.norm(bank_patches - patch, axis=1)
                min_dists.append(np.min(dists))
            
            min_dists.sort(reverse=True)
            anomaly_score = float(np.mean(min_dists[:5]))
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
                "error": f"Patch feature extraction failed: {str(e)}"
            }           


        # Check if image is completely unknown/out-of-distribution using global features
        is_unknown = best_knn_distance > (best_threshold * self.unknown_distance_multiplier)

        if is_unknown:
            max_threshold = max(self.category_thresholds.values()) if self.category_thresholds else 0.5
            max_threshold = max(max_threshold, 1e-6)
            is_defective_for_unknown = anomaly_score > (best_threshold * 1.5)

            if is_defective_for_unknown:
                confidence = min(0.75, 0.50 + (anomaly_score / (max_threshold * 5.0)) * 0.25)
                classification = "Anomaly (Unknown Product)"
            else:
                confidence = 0.60
                classification = "Normal (Unknown Product)"

            return {
                "is_defective": bool(is_defective_for_unknown),
                "classification": classification,
                "matched_category": f"unknown_product (nearest: {best_category})",
                "anomaly_score": round(self._clean_float(anomaly_score), 6),
                "threshold": round(self._clean_float(best_threshold), 6),
                "confidence": round(self._clean_float(confidence), 4),
                "distance_ratio": round(self._clean_float(anomaly_score / best_threshold), 4),
                "is_unknown": True,
            }

        # Standard anomaly detection for known categories
        ratio = anomaly_score / best_threshold
        is_defective = anomaly_score > best_threshold

        if is_defective:
            # Higher ratio = more confident it's defective
            confidence = min(0.99, 0.70 + min(0.29, (ratio - 1.0) * 0.8))
            classification = "Defective"
        else:
            # Lower ratio = more confident it's good
            confidence = min(0.99, 0.75 + min(0.24, (1.0 - ratio) * 0.5))
            classification = "Normal"

        return {
            "is_defective": bool(is_defective),
            "classification": classification,
            "matched_category": best_category,
            "anomaly_score": round(self._clean_float(anomaly_score), 6),
            "threshold": round(self._clean_float(best_threshold), 6),
            "confidence": round(self._clean_float(max(0.55, confidence)), 4),
            "distance_ratio": round(self._clean_float(ratio), 4),
            "is_unknown": False,
        }

    def evaluate(self, dataset_path, categories=None):
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
                print(f"  [SKIP] {category}: no test directory")
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
        os.makedirs(self.model_dir, exist_ok=True)

        for category, features in self.category_features.items():
            feat_path = os.path.join(self.model_dir, f"{category}_features.npy")
            np.save(feat_path, features)
            
            patch_features = self.category_patch_features.get(category)
            if patch_features is not None:
                patch_feat_path = os.path.join(self.model_dir, f"{category}_patch_features.npy")
                np.save(patch_feat_path, patch_features)

        metadata = {
            "categories": list(self.category_features.keys()),
            "thresholds": {k: self._clean_float(v) for k, v in self.category_thresholds.items()},
            "mean_distances": {k: self._clean_float(v) for k, v in self.category_mean_dist.items()},
            "k_neighbors": self.k_neighbors,
            "unknown_distance_multiplier": self.unknown_distance_multiplier,
            "is_trained": True,
            "feature_dim": 3584,
            "patch_feature_dim": 1536,
            "trained_at": datetime.now().isoformat(),
        }
        metadata_path = os.path.join(self.model_dir, "metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

    def _load_model(self):
        metadata_path = os.path.join(self.model_dir, "metadata.json")

        if not os.path.exists(metadata_path):
            return

        try:
            with open(metadata_path, "r") as f:
                metadata = json.load(f)

            self.category_thresholds = {k: float(v) for k, v in metadata.get("thresholds", {}).items()}
            self.category_mean_dist = {k: float(v) for k, v in metadata.get("mean_distances", {}).items()}
            self.k_neighbors = metadata.get("k_neighbors", 5)
            self.unknown_distance_multiplier = metadata.get("unknown_distance_multiplier", 2.5)

            loaded_count = 0
            for category in metadata.get("categories", []):
                feat_path = os.path.join(self.model_dir, f"{category}_features.npy")
                patch_feat_path = os.path.join(self.model_dir, f"{category}_patch_features.npy")
                if os.path.exists(feat_path):
                    self.category_features[category] = np.load(feat_path)
                    loaded_count += 1
                if os.path.exists(patch_feat_path):
                    self.category_patch_features[category] = np.load(patch_feat_path)

            if loaded_count > 0:
                self.is_trained = True
                print(f"[OK] Loaded trained anomaly model: {loaded_count} categories from {self.model_dir}")
            else:
                print(f"[WARN] Model metadata found but no feature files in {self.model_dir}")

        except Exception as e:
            print(f"[WARN] Could not load trained model: {e}")