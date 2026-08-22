# VisionInspect AI

VisionInspect AI is a full-stack, AI-powered industrial quality inspection system designed to automate defect detection in manufacturing environments using Computer Vision and Deep Learning.

Leveraging the **MVTec Anomaly Detection (MVTec AD)** dataset, the system utilizes the **PatchCore** architecture to identify surface anomalies, generate severity scores, and render real-time defect heatmaps within a dedicated HUD telemetry dashboard.

---

## 🚀 Key Features

- **Automated Defect Detection:** Unsupervised anomaly detection using PyTorch and the PatchCore model.
- **Live Visual Matrix:** Real-time side-by-side comparison of the raw optical feed and the AI-generated defect heatmap overlay.
- **Role-Based Access Control (RBAC):** Secure JWT authentication with distinct permission levels for Admins, Quality Engineers, and Factory Supervisors.
- **Automated Severity Scoring:** Calculates the defect area percentage and spatial distance from the center to assign a severity grade (Low/Medium/High).
- **Fully Containerized:** One-click cross-platform deployment using Docker and Docker Compose.

---

## 🛠️ Tech Stack

**Frontend**
- React & Vite
- Tailwind CSS

**Backend**
- Python 3
- FastAPI & Uvicorn
- SQLite & SQLAlchemy ORM
- JWT Authentication

**AI & Computer Vision**
- PyTorch & Torchvision
- Anomalib (PatchCore)
- OpenCV & NumPy

**DevOps & Infrastructure**
- Docker & Docker Compose
- Cloudflare Tunnels (Remote Access)

---

## 📁 Project Structure

```text
VisionInspectAI/
│
├── dataset/                  # MVTec AD Dataset
├── src/
│   ├── backend/               # FastAPI application, auth, and SQLite DB
│   ├── frontend/              # React/Vite telemetry dashboard
│   ├── inference/             # PyTorch predictive logic & dynamic paths
│   ├── notebooks/              # Original EDA & preprocessing scripts
│   └── predictions/            # Generated heatmaps and fallback overlays
│
├── docker-compose.yml         # Multi-container orchestration
├── README.md
└── .gitignore
```

---

## ⚙️ Installation & Deployment

This project is fully containerized. You do not need to install local Python environments or Node modules to run the application.

### 1. Prerequisites

Ensure you have the following installed on your machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 2. Clone the Repository

```bash
git clone <repository-url>
cd VisionInspectAI
```

### 3. Run the Application

Build and spin up the backend API and frontend dashboard simultaneously using Docker Compose:

```bash
docker compose up --build
```

### 4. Access the Dashboard

Once the terminal displays `Application startup complete`, open your browser and navigate to:

- **Frontend UI:** `http://localhost:5173`
- **Backend API Docs (Swagger):** `http://localhost:8000/docs`

*(Default demo accounts for `admin` and `supervisor` are automatically seeded on database initialization for immediate testing.)*

---

## 📈 Project Roadmap & Status

- [x] Environment Setup & Dataset Exploration (EDA)
- [x] Image Preprocessing & Feature Extraction
- [x] PatchCore Model Training & Configuration
- [x] FastAPI Backend Development & SQLite Integration
- [x] React/Vite Frontend Dashboard Development
- [x] AI Prediction Pipeline Integration (batch validation across all 15 MVTec AD categories)
- [x] Dynamic Cross-Platform Pathing & Base64 Image Rendering
- [x] Docker Containerization & Deployment (with public demo via Cloudflare Tunnel)

---

## 📝 License

This project is licensed under the MIT License.
