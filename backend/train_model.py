#!/usr/bin/env python
"""
VisionInspect AI - Model Training Script

Trains the anomaly detection model on the MVTec AD dataset.
This must be run ONCE before the system can make accurate predictions.

The script:
  1. Loads pretrained ResNet-18 for feature extraction
  2. Processes all "good" training images for each product category
  3. Builds a feature memory bank per category
  4. Computes anomaly detection thresholds
  5. Saves the trained model to backend/models/trained/

Usage:
    cd backend
    python train_model.py                          # Train on all categories
    python train_model.py --evaluate               # Train + evaluate accuracy
    python train_model.py --eval-only              # Only evaluate (no retraining)
    python train_model.py --categories bottle hazelnut  # Train specific categories
"""

import sys
import os
import argparse
import time

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ml_engine.anomaly_detector import TrainedAnomalyDetector


def main():
    parser = argparse.ArgumentParser(
        description="VisionInspect AI - Train Anomaly Detection Model on MVTec AD",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train_model.py                           Train all 15 MVTec categories
  python train_model.py --evaluate                Train + evaluate accuracy on test set
  python train_model.py --eval-only               Evaluate existing model (skip training)
  python train_model.py --categories bottle pill   Train only specific categories
        """
    )
    parser.add_argument(
        "--dataset", type=str, default="../data/mvtec_ad",
        help="Path to MVTec AD dataset directory (default: ../data/mvtec_ad)"
    )
    parser.add_argument(
        "--model-dir", type=str, default="models/trained",
        help="Directory to save/load trained model (default: models/trained)"
    )
    parser.add_argument(
        "--categories", nargs="+", default=None,
        help="Specific categories to train on (default: all available)"
    )
    parser.add_argument(
        "--evaluate", action="store_true",
        help="Evaluate model accuracy on the test set after training"
    )
    parser.add_argument(
        "--eval-only", action="store_true",
        help="Only evaluate an existing trained model, don't retrain"
    )

    args = parser.parse_args()

    # Resolve dataset path
    dataset_path = os.path.abspath(args.dataset)
    if not os.path.exists(dataset_path):
        # Try alternate common locations
        alt_paths = [
            os.path.join(os.path.dirname(__file__), "..", "data", "mvtec_ad"),
            os.path.join(os.path.dirname(__file__), "data", "mvtec_ad"),
        ]
        found = False
        for alt in alt_paths:
            alt = os.path.abspath(alt)
            if os.path.exists(alt):
                dataset_path = alt
                found = True
                break
        
        if not found:
            print(f"[ERROR] MVTec AD dataset not found!")
            print(f"   Searched: {dataset_path}")
            for alt in alt_paths:
                print(f"   Searched: {os.path.abspath(alt)}")
            print(f"\n   Please ensure the MVTec AD dataset is at: data/mvtec_ad/")
            sys.exit(1)

    model_dir = os.path.abspath(args.model_dir)

    print()
    print("+" + "=" * 58 + "+")
    print("|   VisionInspect AI - Anomaly Detection Model Training    |")
    print("+" + "=" * 58 + "+")
    print()
    print(f"  Dataset Path  : {dataset_path}")
    print(f"  Model Output  : {model_dir}")
    if args.categories:
        print(f"  Categories    : {', '.join(args.categories)}")
    else:
        print(f"  Categories    : ALL (auto-detect)")
    print()

    # Initialize detector
    detector = TrainedAnomalyDetector(model_dir=model_dir)

    # Training phase
    if not args.eval_only:
        print("Phase 1: Training on MVTec AD 'good' images...")
        print("-" * 60)
        
        start_time = time.time()
        detector.train(dataset_path, categories=args.categories)
        elapsed = time.time() - start_time
        
        minutes = int(elapsed // 60)
        seconds = int(elapsed % 60)
        print(f"  Total training time: {minutes}m {seconds}s")
    else:
        if not detector.is_trained:
            print("[ERROR] No trained model found! Run without --eval-only first.")
            sys.exit(1)
        print(f"  Loaded existing model with {len(detector.category_features)} categories")

    # Evaluation phase
    if args.evaluate or args.eval_only:
        print()
        print("Phase 2: Evaluating on MVTec AD test set...")
        print("-" * 60)
        
        start_time = time.time()
        results = detector.evaluate(dataset_path, categories=args.categories)
        elapsed = time.time() - start_time

        if results:
            print(f"\n  Evaluation time: {elapsed:.1f}s")
            print(f"  Final Accuracy : {results['overall_accuracy']*100:.1f}%")
            print(f"  Total Images   : {results['total_images']}")
            
            # Show best and worst categories
            if results['per_category']:
                sorted_cats = sorted(
                    results['per_category'].items(),
                    key=lambda x: x[1]['accuracy'],
                    reverse=True
                )
                print(f"\n  Best  category : {sorted_cats[0][0]} ({sorted_cats[0][1]['accuracy']*100:.1f}%)")
                print(f"  Worst category : {sorted_cats[-1][0]} ({sorted_cats[-1][1]['accuracy']*100:.1f}%)")

    print()
    print("+" + "=" * 58 + "+")
    print("|   Training complete! Restart the FastAPI server to       |")
    print("|   load the trained model for accurate predictions.       |")
    print("+" + "=" * 58 + "+")
    print()


if __name__ == "__main__":
    main()
