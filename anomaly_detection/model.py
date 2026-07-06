import torch
import torch.nn as nn

class AnomalyAutoencoder(nn.Module):
    """
    A Convolutional Autoencoder for Unsupervised Anomaly Detection.
    Learns to reconstruct normal images. Anomalies will have high reconstruction error.
    """
    def __init__(self):
        super(AnomalyAutoencoder, self).__init__()
        
        # Encoder: C128 x H128 x W128 -> Latent space representation
        self.encoder = nn.Sequential(
            # Input: 3 x 128 x 128
            nn.Conv2d(3, 32, kernel_size=4, stride=2, padding=1), # 32 x 64 x 64
            nn.BatchNorm2d(32),
            nn.ReLU(True),
            
            nn.Conv2d(32, 64, kernel_size=4, stride=2, padding=1), # 64 x 32 x 32
            nn.BatchNorm2d(64),
            nn.ReLU(True),
            
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1), # 128 x 16 x 16
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            
            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1), # 256 x 8 x 8
            nn.BatchNorm2d(256),
            nn.ReLU(True)
        )
        
        # Decoder: Latent space -> Reconstructed 3 x 128 x 128 image
        self.decoder = nn.Sequential(
            # Input: 256 x 8 x 8
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1), # 128 x 16 x 16
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1), # 64 x 32 x 32
            nn.BatchNorm2d(64),
            nn.ReLU(True),
            
            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1), # 32 x 64 x 64
            nn.BatchNorm2d(32),
            nn.ReLU(True),
            
            nn.ConvTranspose2d(32, 3, kernel_size=4, stride=2, padding=1), # 3 x 128 x 128
            nn.Sigmoid()  # Reconstruct to [0, 1] range
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed

    def compute_anomaly_map(self, x):
        """
        Computes the pixel-wise reconstruction error (L2 distance) between input and reconstruction.
        Returns a heatmap-style anomaly map and a scalar anomaly score.
        """
        self.eval()
        with torch.no_grad():
            reconstructed = self(x)
            
            # Compute pixel-wise squared error across color channels
            # Shape: [batch, H, W]
            anomaly_map = torch.mean((x - reconstructed) ** 2, dim=1)
            
            # Mean error per image in batch
            # Shape: [batch]
            anomaly_score = torch.mean(anomaly_map.view(anomaly_map.size(0), -1), dim=1)
            
            return reconstructed, anomaly_map, anomaly_score
