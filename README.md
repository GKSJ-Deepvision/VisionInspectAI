# 🔍 Visual AI Quality Inspection & Defect Detection System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat&logo=python)](https://www.python.org/)

An enterprise-grade, automated visual inspection platform engineered for real-time defect detection and quality assurance on industrial assembly lines. Leveraging **FastAPI**, **SQLAlchemy**, and **React 19**, the system processes high-resolution target scans using an **Autoencoder (AE) Reconstruction Engine** to pinpoint structural anomalies, compute exact severity metrics, render defect heatmaps, and generate production-line certificates.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend Layer ["React 19 + Vite Dashboard"]
        UI[Interactive UI Console]
        Slider[Drag-to-Compare Slider]
        Metrics[Real-Time Analytics Dashboard]
    end

    subgraph API Layer ["FastAPI Application"]
        Router[REST API Router]
        DB_Dep[SQLAlchemy Session Manager]
        Failsafe[ML Engine Failsafe Handler]
    end

    subgraph ML Vision Pipeline ["Autoencoder Inspection Engine"]
        Pre[1. CLAHE Contrast Enhancement]
        AE[2. AE Reconstruction & Anomaly Scoring]
        BBox[3. Defect Bounding Box Localization]
        Heatmap[4. Defect Heatmap Overlay Generation]
    end

    subgraph Storage & Persistence ["Database & Disk"]
        DB[(SQLAlchemy DB / SQLite / Postgres)]
        Disk[("Local Storage (/storage/raw_images & /storage/heatmaps)")]
    end

    UI -->|Multipart Upload / JSON| Router
    Router --> DB_Dep
    DB_Dep --> DB
    Router --> Failsafe
    Failsafe --> Pre
    Pre --> AE --> BBox --> Heatmap
    Heatmap -->|Save Artifacts| Disk
    Heatmap -->|Anomaly Score & Coordinates| Router
    Router -->|JSON Response & Image Paths| UI
    Metrics -->|GET /analytics/*| Router
```
# Key Features

- **4-Stage Visual Inspection Pipeline**
  1. **Original Scan**: Raw frame ingestion.
  2. **CLAHE Enhancement**: Contrast Limited Adaptive Histogram Equalization for enhanced surface texture visibility.
  3. **AE Reconstruction**: Reconstruction error quantification with bounding box localization (e.g., `Defect (297px)`).
  4. **Defect Heatmap Overlay**: Thermal visual representation of structural anomalies.

- **Quantitative Anomaly Scoring**: Measures exact reconstruction errors (e.g., `74.34 Anomaly Score`) against dynamic thresholds for instant **PASS / FAIL** verdicts.
- **Interactive Operator Console**: Features drag-to-compare visual sliders (Original vs. AI Heatmap), single-click manual overrides, and PDF/Print quality certificate export.
- **Batch & Single Processing**: Asynchronous handling of individual uploads alongside high-throughput batch inspection endpoints.
- **Executive Quality Analytics**: Built-in REST endpoints for 30-day defect trends, severity distribution (`NONE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), average processing latency, and failure rates.
- **Zero-Downtime Engine Failsafe**: Fallback mechanism prevents backend crashes if model dependencies are missing or undergoing maintenance.



## 🖥️ Application Preview

### Visual Inspection Dashboard

![Visual AI Quality Inspection Dashboard](docs/screenshots/inspection-dashboard.png)

> **Operator Console** - Real-time visual inspection with original scan, AI reconstruction, defect heatmap, anomaly score, severity classification, and PASS/FAIL decision.

### Inspection Result

![AI Defect Detection Result](docs/screenshots/inspection-result.png)

> **AI Inspection Result** - Displays detected defects, anomaly scores, bounding-box localization, confidence, and heatmap visualization.

---
## 🛠️ Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **Database & ORM**: SQLAlchemy (SQLite / PostgreSQL)
- **Computer Vision & ML**: OpenCV, Pillow, PyTorch / TensorFlow (Autoencoder Engine)
- **ASGI Server**: Uvicorn

### Frontend

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **UI & Animation**: Framer Motion, Lucide React
- **Data Visualization**: Recharts
- **HTTP Client**: Axios

## 📂 Database Schema

### `users`

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `Integer` | Primary Key, Auto-increment |
| `username` | `String` | Unique, Indexed |
| `email` | `String` | Unique, Indexed |
| `hashed_password` | `String` | Encrypted password string |
| `role` | `Enum(UserRole)` | `ADMIN`, `OPERATOR`, `INSPECTOR` |
| `is_active` | `Boolean` | User status flag (Default: `True`) |
| `created_at` | `DateTime` | UTC Timestamp |

### `products`

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `Integer` | Primary Key, Auto-increment |
| `sku` | `String` | Unique product identifier (e.g., `MVI-PROD-2026`) |
| `name` | `String` | Product label |
| `category` | `String` | Component classification (e.g., `GRID`) |
| `created_at` | `DateTime` | UTC Timestamp |

### `inspection_records`

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `Integer` | Primary Key, Auto-increment |
| `inspection_id` | `String` | Unique run identifier (e.g., `INS-20260815_190000`) |
| `product_id` | `Integer` | Foreign Key (`products.id`) |
| `product_sku` | `String` | Target SKU code |
| `raw_image_path` | `String` | Storage path to raw target frame |
| `heatmap_image_path` | `String` | Storage path to generated AI heatmap |
| `pass_fail_decision` | `String` | System verdict (`PASS`, `FAIL`) |
| `is_defective` | `Boolean` | Defect detection flag |
| `defect_type` | `String` | Identified anomaly (e.g., `Missing Component`) |
| `severity_level` | `Enum(SeverityLevel)` | `NONE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `overall_severity_score` | `Float` | Measured anomaly reconstruction metric |
| `confidence_score` | `Float` | Model confidence percentage |
| `latency_ms` | `Float` | Complete inference time in milliseconds |
| `created_at` | `DateTime` | UTC Timestamp |

## 📡 API Endpoints Summary

### Inspection & Operations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/inspect` | Accepts a single frame for AE analysis, generates heatmap overlays, and persists inspection metadata. |
| `POST` | `/batch-inspect` | Batch process multi-file inspection runs. |
| `GET` | `/inspections` | Paginated retrieval of historical inspection records. |
| `GET` | `/inspections/{inspection_id}` | Retrieves complete execution record by inspection ID. |
| `GET` | `/products` | Fetches registered product SKUs and categories. |

### Executive Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/summary` | Returns total counts, overall pass/fail rates, average confidence, and latency. |
| `GET` | `/analytics/defect-trends` | Returns day-by-day pass, fail, and defect totals for the last 30 days. |
| `GET` | `/analytics/severity-distribution` | Categorical inspection volume across severity tiers. |
| `GET` | `/analytics/defect-types` | Frequency breakdown categorized by defect type. |
| `GET` | `/analytics/recent-inspections` | Latest detailed execution logs. |

## ⚡ Quick Start & Setup

### Prerequisites

- **Python**: 3.10+
- **Node.js**: v18+

### 1. Backend Setup

```bash
cd backend

uvicorn main:app --reload
```
API Interactive Documentation (Swagger UI): http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend
npm run dev -- --force
```
Operator Console Dashboard: http://localhost:5173