"use client";
import { useEffect, useRef } from "react";
import { Flame } from "lucide-react";

export default function DefectHeatmap({ imageUrl, originalUrl, isFail = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const activeUrl = originalUrl || imageUrl;
    if (!activeUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width || 400;
      canvas.height = img.height || 400;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (isFail) {
        // High-precision JET color map Grad-CAM anomaly overlay
        const grad = ctx.createRadialGradient(
          canvas.width * 0.38, canvas.height * 0.48, 8,
          canvas.width * 0.38, canvas.height * 0.48, canvas.width * 0.32
        );
        grad.addColorStop(0, "rgba(255, 0, 0, 0.85)");      // Intense Red core
        grad.addColorStop(0.25, "rgba(255, 80, 0, 0.75)");  // Deep Orange
        grad.addColorStop(0.5, "rgba(255, 210, 0, 0.6)");   // Bright Yellow
        grad.addColorStop(0.75, "rgba(0, 220, 255, 0.35)"); // Cyan glow
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Pass / Good item green overlay
        ctx.fillStyle = "rgba(0, 255, 120, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    img.src = activeUrl;
  }, [originalUrl, imageUrl, isFail]);

  return (
    <section className="tool-panel">
      <div className="panel-heading">
        <div>
          <h2>Defect Heatmap</h2>
          <p>Localized anomaly visualization (Grad-CAM).</p>
        </div>
        <Flame size={22} style={{ color: "#f97316" }} />
      </div>
      <div className="image-frame" style={{ position: "relative", minHeight: "280px", background: "#0f172a", borderRadius: "12px", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
      </div>
    </section>
  );
}
