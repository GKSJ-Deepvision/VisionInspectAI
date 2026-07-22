import torch
import torch.nn as nn
import torch.nn.functional as F


def weights_init(m):
    """
    Kaiming Normal weight initialization for Conv2d/ConvTranspose2d and
    Gaussian initialization for BatchNorm2d layers. Improves convergence speed
    and gradient stability during Autoencoder training.
    """
    if isinstance(m, (nn.Conv2d, nn.ConvTranspose2d)):
        nn.init.kaiming_normal_(m.weight, a=0.2, mode='fan_in', nonlinearity='leaky_relu')
        if m.bias is not None:
            nn.init.constant_(m.bias, 0.0)
    elif isinstance(m, (nn.BatchNorm2d, nn.GroupNorm)):
        if m.weight is not None:
            nn.init.normal_(m.weight, 1.0, 0.02)
        if m.bias is not None:
            nn.init.constant_(m.bias, 0.0)


class AnomalyAutoencoder(nn.Module):
    """
    Convolutional Autoencoder for Unsupervised Anomaly Detection.

    Architecture exactly matches existing checkpoint weights for backward compatibility:
        encoder: Sequential of Conv2d(stride=2) → BN → LeakyReLU blocks
        decoder: Sequential of ConvTranspose2d(stride=2) → BN → ReLU blocks
    """
    def __init__(self):
        super(AnomalyAutoencoder, self).__init__()

        self.encoder = nn.Sequential(
            nn.Conv2d(3,   32,  kernel_size=4, stride=2, padding=1),  # 128→64
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(32,  64,  kernel_size=4, stride=2, padding=1),  # 64→32
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(64,  128, kernel_size=4, stride=2, padding=1),  # 32→16
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1),  # 16→8
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
        )

        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),  # 8→16
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(128, 64,  kernel_size=4, stride=2, padding=1),  # 16→32
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(64,  32,  kernel_size=4, stride=2, padding=1),  # 32→64
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),

            nn.ConvTranspose2d(32,  3,   kernel_size=4, stride=2, padding=1),  # 64→128
            nn.Sigmoid(),
        )

        # Apply robust weight initialization
        self.apply(weights_init)

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)


class ResBlock(nn.Module):
    """Residual bottleneck block for feature preservation."""
    def __init__(self, channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(channels)
        )
        self.act = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        return self.act(x + self.conv(x))


class ResizeConv2d(nn.Module):
    """
    Resize-Convolution block (Bilinear Upsampling + Conv2d).
    Replaces ConvTranspose2d to eliminate checkerboard artifacts in reconstructed images.
    """
    def __init__(self, in_channels, out_channels, kernel_size=3, scale_factor=2):
        super().__init__()
        self.scale_factor = scale_factor
        self.conv = nn.Conv2d(
            in_channels, out_channels, kernel_size=kernel_size,
            padding=kernel_size // 2, bias=False
        )
        self.bn = nn.BatchNorm2d(out_channels)
        self.act = nn.ReLU(inplace=True)

    def forward(self, x):
        x = F.interpolate(x, scale_factor=self.scale_factor, mode='bilinear', align_corners=False)
        x = self.conv(x)
        x = self.bn(x)
        return self.act(x)


class OptimizedAnomalyAutoencoder(nn.Module):
    """
    High-Fidelity Anomaly Autoencoder using Resize-Convolutions and Bottleneck ResBlocks.
    Eliminates transposed convolution checkerboard artifacts and maximizes reconstruction fidelity.
    """
    def __init__(self):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, 4, stride=2, padding=1),   # 128→64
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(32, 64, 4, stride=2, padding=1),  # 64→32
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(64, 128, 4, stride=2, padding=1), # 32→16
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(128, 256, 4, stride=2, padding=1),# 16→8
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),

            ResBlock(256)
        )

        self.decoder = nn.Sequential(
            ResizeConv2d(256, 128, scale_factor=2),     # 8→16
            ResizeConv2d(128, 64,  scale_factor=2),     # 16→32
            ResizeConv2d(64,  32,  scale_factor=2),     # 32→64
            nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False), # 64→128
            nn.Conv2d(32, 3, 3, padding=1),
            nn.Sigmoid()
        )

        self.apply(weights_init)

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)


class SkipAutoencoder(nn.Module):
    """
    Deep ConvNet Autoencoder with Skip Connections & Residual Blocks.
    Preserves fine spatial features needed for micro-defect detection.
    """
    def __init__(self):
        super().__init__()
        self.enc1 = nn.Sequential(nn.Conv2d(3, 32, 4, stride=2, padding=1), nn.BatchNorm2d(32), nn.LeakyReLU(0.2)) # 64x64
        self.enc2 = nn.Sequential(nn.Conv2d(32, 64, 4, stride=2, padding=1), nn.BatchNorm2d(64), nn.LeakyReLU(0.2)) # 32x32
        self.enc3 = nn.Sequential(nn.Conv2d(64, 128, 4, stride=2, padding=1), nn.BatchNorm2d(128), nn.LeakyReLU(0.2)) # 16x16
        self.res = ResBlock(128)
        
        self.dec3 = nn.Sequential(nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1), nn.BatchNorm2d(64), nn.ReLU()) # 32x32
        self.dec2 = nn.Sequential(nn.ConvTranspose2d(128, 32, 4, stride=2, padding=1), nn.BatchNorm2d(32), nn.ReLU()) # 64x64
        self.dec1 = nn.Sequential(nn.ConvTranspose2d(64, 3, 4, stride=2, padding=1), nn.Sigmoid()) # 128x128

        self.apply(weights_init)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        e3 = self.res(self.enc3(e2))
        
        d3 = self.dec3(e3)
        d2 = self.dec2(torch.cat([d3, e2], dim=1)) # Skip connection at 32x32
        out = self.dec1(torch.cat([d2, e1], dim=1)) # Skip connection at 64x64
        return out



class SSIML1Loss(nn.Module):
    """
    Structural Similarity (SSIM) + L1 Loss for Autoencoder Reconstruction Training.
    Provides robust device/dtype buffer casting and lower-bound clamping for numerical precision.
    """
    def __init__(self, alpha=0.4, window_size=11):
        super().__init__()
        self.alpha = alpha
        self.window_size = window_size
        self.register_buffer('kernel', self._gaussian_kernel(window_size, 1.5))

    def _gaussian_kernel(self, size, sigma):
        coords = torch.arange(size, dtype=torch.float32) - size // 2
        g = torch.exp(-(coords ** 2) / (2 * sigma ** 2))
        kernel = g[:, None] * g[None, :]
        kernel = kernel / kernel.sum()
        return kernel.unsqueeze(0).unsqueeze(0).repeat(3, 1, 1, 1)

    def ssim(self, x, y):
        C1, C2 = 0.01 ** 2, 0.03 ** 2
        kernel = self.kernel.to(device=x.device, dtype=x.dtype)
        padding = self.window_size // 2

        mu_x = F.conv2d(x, kernel, padding=padding, groups=3)
        mu_y = F.conv2d(y, kernel, padding=padding, groups=3)
        
        sigma_x2 = F.conv2d(x * x, kernel, padding=padding, groups=3) - mu_x ** 2
        sigma_y2 = F.conv2d(y * y, kernel, padding=padding, groups=3) - mu_y ** 2
        sigma_xy = F.conv2d(x * y, kernel, padding=padding, groups=3) - mu_x * mu_y
        
        num = (2 * mu_x * mu_y + C1) * (2 * sigma_xy + C2)
        den = (mu_x ** 2 + mu_y ** 2 + C1) * (sigma_x2 + sigma_y2 + C2)
        return (num / (den + 1e-8)).mean()

    def forward(self, x, y):
        l1 = F.l1_loss(x, y)
        ssim_val = self.ssim(x, y)
        ssim_loss = torch.clamp(1.0 - ssim_val, min=0.0)
        return self.alpha * l1 + (1.0 - self.alpha) * ssim_loss
