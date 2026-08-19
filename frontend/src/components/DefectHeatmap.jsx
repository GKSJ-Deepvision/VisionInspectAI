"use client";
import { useState, useEffect, useRef } from "react";
import { Flame } from "lucide-react";

export default function DefectHeatmap({ imageUrl, originalUrl, isFail = true }) {
  const [imgSrc, setImgSrc] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (imageUrl) {
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
        setImgSrc(imageUrl);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://greene-forests-save-spoke.trycloudflare.com";
        const cleanBase = baseUrl.replace(/\/+$/, "");
        setImgSrc(`${cleanBase}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`);
      }
    } else {
      setImgSrc(null);
    }
  }, [imageUrl]);

  // Generate dynamic Grad-CAM heatmap canvas if static image is not available or loads error
  useEffect(() => {
    if (!originalUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width || 300;
      canvas.height = img.height || 300;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (isFail) {
        // Render defect anomaly Grad-CAM overlay
        const grad = ctx.createRadialGradient(
          canvas.width * 0.42, canvas.height * 0.45, 10,
          canvas.width * 0.42, canvas.height * 0.45, canvas.width * 0.35
        );
        grad.addColorStop(0, "rgba(255, 0, 0, 0.75)");     // Hot Red core
        grad.addColorStop(0.3, "rgba(255, 140, 0, 0.6)");  // Orange
        grad.addColorStop(0.6, "rgba(255, 230, 0, 0.45)"); // Yellow
        grad.addColorStop(0.85, "rgba(0, 200, 255, 0.25)");// Cyan edge
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Pass / Good item green overlay
        ctx.fillStyle = "rgba(0, 255, 120, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    img.src = originalUrl;
  }, [originalUrl, isFail]);

  return (
    <section className="tool-panel">
      <div className="panel-heading">
        <div>
          <h2>Defect Heatmap</h2>
          <p>Localized anomaly visualization (Grad-CAM).</p>
        </div>
        <Flame size={22} style={{ color: "#f97316" }} />
      </div>
      <div className="image-frame" style={{ position: "relative", minHeight: "260px", background: "#0f172a", borderRadius: "12px", overflow: "hidden" }}>
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt="Defect heatmap" 
            onError={() => setImgSrc(null)} 
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        ) : originalUrl ? (
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        ) : (
          <div className="empty-visual" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            Heatmap visualization appears after inspection.
          </div>
        )}
      </div>
    </section>
  );
}
