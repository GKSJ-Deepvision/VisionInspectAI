import torch
import torch.nn as nn
import torch.nn.functional as F

def create_gaussian_window(window_size=11, sigma=1.5, channels=3):
    """Generates a 2D Gaussian kernel for SSIM calculation."""
    coords = torch.arange(window_size, dtype=torch.float32) - window_size // 2
    g = torch.exp(-(coords ** 2) / (2 * sigma ** 2))
    g = g / g.sum()
    window_1d = g.unsqueeze(1)
    window_2d = window_1d.mm(window_1d.t()).float().unsqueeze(0).unsqueeze(0)
    window = window_2d.expand(channels, 1, window_size, window_size).contiguous()
    return window

def compute_ssim_map(img1, img2, window_size=11, size_average=True):
    """
    Computes Structural Similarity Index (SSIM) map between two image tensors (B x C x H x W).
    Returns a per-pixel dissimilarity map (1.0 - SSIM) ranging in [0, 1].
    """
    channels = img1.size(1)
    window = create_gaussian_window(window_size, 1.5, channels).to(img1.device)
    
    padding = window_size // 2
    mu1 = F.conv2d(img1, window, padding=padding, groups=channels)
    mu2 = F.conv2d(img2, window, padding=padding, groups=channels)
    
    mu1_sq = mu1.pow(2)
    mu2_sq = mu2.pow(2)
    mu1_mu2 = mu1 * mu2
    
    sigma1_sq = F.conv2d(img1 * img1, window, padding=padding, groups=channels) - mu1_sq
    sigma2_sq = F.conv2d(img2 * img2, window, padding=padding, groups=channels) - mu2_sq
    sigma12 = F.conv2d(img1 * img2, window, padding=padding, groups=channels) - mu1_mu2
    
    c1 = 0.01 ** 2
    c2 = 0.03 ** 2
    
    ssim_map = ((2 * mu1_mu2 + c1) * (2 * sigma12 + c2)) / ((mu1_sq + mu2_sq + c1) * (sigma1_sq + sigma2_sq + c2))
    # Structural dissimilarity: 1.0 - SSIM (range 0.0 to 1.0)
    dssim_map = torch.mean((1.0 - ssim_map) / 2.0, dim=1)
    return dssim_map

class AnomalyAutoencoder(nn.Module):
    """
    Convolutional Autoencoder with Hybrid MSE + SSIM Anomaly Mapping
    Learns to reconstruct normal images. Anomalies cause high structural (SSIM) & pixel (MSE) errors.
    """
    def __init__(self):
        super(AnomalyAutoencoder, self).__init__()
        
        # Encoder: 3 x 128 x 128 -> Latent space representation (256 x 8 x 8)
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=4, stride=2, padding=1),  # 32 x 64 x 64
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
        
        # Decoder: Latent space (256 x 8 x 8) -> Reconstructed 3 x 128 x 128 image
        self.decoder = nn.Sequential(
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

    def compute_anomaly_map(self, x, use_ssim=True):
        """
        Computes the pixel-wise reconstruction error map and scalar anomaly score.
        Uses Hybrid MSE (Pixel-wise L2) + SSIM (Structural Similarity) mapping.
        """
        self.eval()
        with torch.no_grad():
            reconstructed = self(x)
            
            # 1. Pixel-wise L2 (MSE) squared error map across color channels
            mse_map = torch.mean((x - reconstructed) ** 2, dim=1)
            
            if use_ssim:
                # 2. Structural Dissimilarity Map (SSIM)
                ssim_map = compute_ssim_map(x, reconstructed)
                # Hybrid Anomaly Map: 50% MSE + 50% SSIM
                anomaly_map = 0.5 * mse_map + 0.5 * ssim_map
            else:
                anomaly_map = mse_map
            
            # Localized anomaly score: average of the top 5% highest error pixels.
            flat_map = anomaly_map.view(anomaly_map.size(0), -1)
            num_pixels = flat_map.size(1)
            k = max(1, int(num_pixels * 0.05)) # top 5% pixels
            
            top_k_values, _ = torch.topk(flat_map, k, dim=1)
            anomaly_score = torch.mean(top_k_values, dim=1)
            
            return reconstructed, anomaly_map, anomaly_score
