import os
import torch
import torch.nn as nn
import torch.optim as optim
from . import config
from .dataset import get_dataloaders
from .model import AnomalyAutoencoder

def train_model(category=None, num_epochs=None):
    category = category or config.CATEGORY
    num_epochs = num_epochs or config.NUM_EPOCHS
    
    device = torch.device(config.DEVICE)
    print(f"Training Anomaly Autoencoder for category: '{category}' on device: {device}")
    
    # Get dataloaders
    try:
        train_loader, test_loader = get_dataloaders(category=category)
    except FileNotFoundError as e:
        print(f"Error loading dataset: {e}")
        print("Please check config.DATASET_DIR path.")
        return None
        
    # Initialize Model, Loss, Optimizer
    model = AnomalyAutoencoder().to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=config.LEARNING_RATE)
    
    best_loss = float('inf')
    
    # Training Loop (Unsupervised: trains only on GOOD/NORMAL samples)
    model.train()
    for epoch in range(1, num_epochs + 1):
        running_loss = 0.0
        for batch_idx, (imgs, _, _, _) in enumerate(train_loader):
            imgs = imgs.to(device)
            
            # Forward pass
            outputs = model(imgs)
            loss = criterion(outputs, imgs)  # Reconstruct input
            
            # Backward pass and optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * imgs.size(0)
            
        epoch_loss = running_loss / len(train_loader.dataset)
        print(f"Epoch [{epoch}/{num_epochs}] - Reconstruction Loss: {epoch_loss:.6f}")
        
        # Save best model
        if epoch_loss < best_loss:
            best_loss = epoch_loss
            # Ensure model dir exists
            config.MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), config.MODEL_PATH)
            
    print(f"Training completed. Best model saved to: {config.MODEL_PATH}")
    
    # Post-training threshold calibration
    calibrate_threshold(model, test_loader, device)
    
    return model

def calibrate_threshold(model, test_loader, device):
    """
    Evaluates the model on the test dataset (which contains normal and anomalous images)
    and prints anomaly scores to help choose an optimal decision threshold.
    """
    model.eval()
    normal_scores = []
    anomaly_scores = []
    
    print("\n--- Calibrating Anomaly Detection Threshold ---")
    with torch.no_grad():
        for imgs, labels, defect_types, _ in test_loader:
            imgs = imgs.to(device)
            _, _, scores = model.compute_anomaly_map(imgs)
            
            scores = scores.cpu().numpy()
            labels = labels.numpy()
            
            for score, label in zip(scores, labels):
                if label == 0:
                    normal_scores.append(score)
                else:
                    anomaly_scores.append(score)
                    
    if normal_scores and anomaly_scores:
        avg_normal = sum(normal_scores) / len(normal_scores)
        avg_anomaly = sum(anomaly_scores) / len(anomaly_scores)
        
        # Suggest threshold as midway between average normal and anomaly scores
        suggested_threshold = (avg_normal + avg_anomaly) / 2
        
        print(f"Average Normal (Good) reconstruction score: {avg_normal:.6f}")
        print(f"Average Anomalous (Defect) reconstruction score: {avg_anomaly:.6f}")
        print(f"Suggested Threshold: {suggested_threshold:.6f}")
        
        # Let's save suggested threshold to config dynamic file if needed, or print it.
        # We can update the config value or use it directly in API inference.
    else:
        print("No test samples available to calibrate threshold.")

if __name__ == "__main__":
    train_model()
