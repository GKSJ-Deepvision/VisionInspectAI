
import json
import logging
import time
import pandas as pd
import torch
import torch.nn as nn

from tqdm import tqdm
from torch.amp import GradScaler, autocast
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from data import config
from models.defect_classifier import build_classifier
from utils.classifier_dataset import ClassifierDatasetBuilder

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


class ClassifierTrainer:

    def __init__(self):

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        builder = ClassifierDatasetBuilder()

        (self.train_loader,
         self.validation_loader,
         self.class_to_index,
         self.index_to_class) = builder.build()

        self.num_classes = len(self.class_to_index)

        self.model = build_classifier(self.num_classes).to(self.device)

        self.criterion = nn.CrossEntropyLoss()

        self.optimizer = AdamW(
            self.model.parameters(),
            lr=config.CLASSIFIER_LEARNING_RATE,
            weight_decay=config.WEIGHT_DECAY,
        )

        self.scheduler = ReduceLROnPlateau(
            self.optimizer,
            mode="min",
            factor=0.5,
            patience=config.LR_SCHEDULER_PATIENCE,
        )

        self.scaler = GradScaler(
            "cuda",
            enabled=torch.cuda.is_available(),
        )

        self.best_loss = float("inf")
        self.best_accuracy = 0.0
        self.start_epoch = 1

        self.history = {
            "train_loss": [],
            "val_loss": [],
            "train_accuracy": [],
            "val_accuracy": [],
            "precision": [],
            "recall": [],
            "f1": [],
        }

        self.best_path = config.CLASSIFIER_MODEL_PATH
        self.last_path = config.CLASSIFIER_LAST_MODEL_PATH
        self.history_json = config.MODELS_DIR / "classifier_history.json"
        self.history_csv = config.MODELS_DIR / "classifier_metrics.csv"

        if self.last_path.exists():
            self.load_checkpoint()


    def save_checkpoint(self, epoch, val_loss, val_acc):

     if val_loss < self.best_loss:
        self.best_loss = val_loss
        self.best_accuracy = val_acc

     ckpt = {
        "epoch": epoch,
        "model": self.model.state_dict(),
        "optimizer": self.optimizer.state_dict(),
        "scheduler": self.scheduler.state_dict(),
        "history": self.history,
        "best_loss": self.best_loss,
        "best_accuracy": self.best_accuracy,
        "num_classes": self.num_classes,
        "class_to_index": self.class_to_index,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

     torch.save(ckpt, self.last_path)

     if val_loss == self.best_loss:
        torch.save(ckpt, self.best_path)

    def load_checkpoint(self):
        ckpt = torch.load(self.last_path, map_location=self.device)
        self.model.load_state_dict(ckpt["model"])
        self.optimizer.load_state_dict(ckpt["optimizer"])
        self.scheduler.load_state_dict(ckpt["scheduler"])
        self.history = ckpt["history"]
        self.best_loss = ckpt["best_loss"]
        self.best_accuracy = ckpt["best_accuracy"]
        self.start_epoch = ckpt["epoch"] + 1
        logger.info("Resumed from checkpoint.")

    def run_epoch(self, loader, train=True):

        self.model.train(train)

        losses = []
        preds_all = []
        labels_all = []

        bar = tqdm(loader, leave=False)

        for images, labels in bar:

            images = images.to(self.device)
            labels = labels.to(self.device)

            if train:
                self.optimizer.zero_grad()

            with autocast(device_type=self.device.type,
                          enabled=torch.cuda.is_available()):

                outputs = self.model(images)
                loss = self.criterion(outputs, labels)

            if train:
                self.scaler.scale(loss).backward()
                self.scaler.step(self.optimizer)
                self.scaler.update()

            losses.append(loss.item())

            preds = outputs.argmax(1)

            preds_all.extend(preds.cpu().numpy())
            labels_all.extend(labels.cpu().numpy())

            bar.set_postfix(loss=f"{loss.item():.4f}")

        loss = sum(losses) / len(losses)

        acc = accuracy_score(labels_all, preds_all)
        prec = precision_score(labels_all, preds_all, average="weighted", zero_division=0)
        rec = recall_score(labels_all, preds_all, average="weighted", zero_division=0)
        f1 = f1_score(labels_all, preds_all, average="weighted", zero_division=0)

        return loss, acc, prec, rec, f1

    def train(self):

        patience = 0

        for epoch in range(self.start_epoch, config.CLASSIFIER_EPOCHS + 1):

            logger.info("=" * 80)
            logger.info("Epoch %d/%d", epoch, config.CLASSIFIER_EPOCHS)

            train_loss, train_acc, _, _, _ = self.run_epoch(self.train_loader, True)

            with torch.no_grad():
                val_loss, val_acc, prec, rec, f1 = self.run_epoch(self.validation_loader, False)

            self.scheduler.step(val_loss)

            self.history["train_loss"].append(train_loss)
            self.history["val_loss"].append(val_loss)
            self.history["train_accuracy"].append(train_acc)
            self.history["val_accuracy"].append(val_acc)
            self.history["precision"].append(prec)
            self.history["recall"].append(rec)
            self.history["f1"].append(f1)

            json.dump(self.history, open(self.history_json, "w"), indent=4)
            pd.DataFrame(self.history).to_csv(self.history_csv, index=False)

            logger.info("Train Loss : %.4f", train_loss)
            logger.info("Val Loss   : %.4f", val_loss)
            logger.info("Val Acc    : %.4f", val_acc)

            if val_loss < self.best_loss:
                patience = 0
            else:
                patience += 1

            self.save_checkpoint(epoch, val_loss, val_acc)

            if patience >= config.EARLY_STOPPING_PATIENCE:
                logger.info("Early stopping.")
                break


def main():
    trainer = ClassifierTrainer()
    trainer.train()


if __name__ == "__main__":
    main()
