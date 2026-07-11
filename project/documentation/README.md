# VisionInspect AI

**AI-powered manufacturing defect detection & quality inspection system**
Infosys Springboard Internship — Team GKSJ-Deepvision

---

## Table of Contents

- [About the Project](#about-the-project)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Team](#team)
- [Milestone 1 — What We Built](#milestone-1--what-we-built)
- [What's Next](#whats-next)

---

## About the Project

Manual visual inspection on a production line is slow, inconsistent, and expensive to scale — the same defect can get flagged by one inspector and missed by another. **VisionInspect AI** replaces that manual step with a computer-vision system that inspects product images automatically, consistently, and in real time.

A Quality Engineer or Factory Supervisor uploads one or more product images (single item or a full batch). The system checks each image against what a defect-free version of that product looks like, using an anomaly-detection model trained on normal (non-defective) samples — so it doesn't need thousands of labeled defect examples to work, just a good sense of what "normal" looks like. If it finds an anomaly, it localizes exactly where the defect is on the product, classifies how serious it is, and returns an automated **pass / fail / rework** decision. Every inspection is logged, so the platform can also show production-quality trends over time — which categories fail most often, how severity is trending, and so on.

The target users are manufacturing plants, quality assurance teams, automotive and electronics manufacturers, and industrial automation providers — anywhere a human is currently eyeballing products on a line and could use a consistent second check.

**Severity scoring formula**, used everywhere a defect is scored:

```
Severity Score = (Size × 30%) + (Location × 25%) + (Defect Type × 25%) + (Confidence × 20%)
```

| Score | Level | Action |
|---|---|---|
| 80–100 | Critical | Reject product, immediate action |
| 60–79 | High | Repair / rework recommended |
| 40–59 | Medium | Inspection review required |
| 0–39 | Low | Generally acceptable |

---

## How It Works

1. **Upload** — user logs in (role: Quality Engineer or Factory Supervisor) and uploads a product image or batch of images.
2. **Authenticate & store** — the backend validates the request (JWT) and stores the image.
3. **Preprocess** — the image is validated and standardized for the model.
4. **Detect** — an anomaly-detection model compares the image against learned "normal" features and produces an anomaly score.
5. **Localize & classify** — if a defect is found, it's localized on the image (heatmap + mask) and classified by type.
6. **Score & decide** — the severity formula above produces a score, which maps to a pass/fail/rework decision.
7. **Store & display** — the result is saved to the database and shown on the dashboard, alongside inspection history and analytics.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND — React (Vite) + Tailwind CSS                          │
│  Login (role-based) | Image Upload | Dashboard | History | Analytics │
└──────────────────────────────┬────────────────────────────────┘
                                │ REST (JSON) + JWT
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND — Flask REST API                                         │
│  Auth (JWT) | Upload | Inspection CRUD | Analytics | History     │
└──────────────────────────────┬────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ AI / MODEL LAYER — PatchCore (Anomalib), Wide ResNet50-2 backbone │
│  trained on the MVTec AD dataset                                  │
└──────────────────────────────┬────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE — PostgreSQL                                             │
│  users | inspections | defects | quality_decisions | reports     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Context API |
| Backend | Python, Flask, JWT (PyJWT), Pytest |
| Database | PostgreSQL, SQLAlchemy ORM, pgAdmin 4 |
| AI / CV | PyTorch, Anomalib (PatchCore), Torchvision, OpenCV, NumPy, Pandas |
| Dataset | [MVTec AD](https://www.mvtec.com/research-teaching/datasets/mvtec-ad) — 15 industrial categories |
| Dev Tools | VS Code, Git & GitHub, Docker & cloud deployment (planned) |

---

## Team

| Member | Role |
|---|---|
| Yash Goyal | AI / ML — anomaly detection model & dataset pipeline |
| Arnab Ghosal | Database design & setup |
| Lakshyatha Chamarthy | Backend & REST API |
| Himabindhu Ravuri | Frontend & UI |
| Om Shakthi Vemuganti | Coordination, planning & documentation |

---

## Milestone 1 — What We Built

Milestone 1 covered project initialization, architecture, authentication, image upload, a working dashboard, and dataset integration & preprocessing. Here's what each part of the system actually has behind it today.

### AI / ML Pipeline (Yash)

- Loaded the complete **MVTec AD dataset** — 15 categories, 3,629 training images, 1,725 test images (467 good / 1,258 defective), 1,258 ground-truth masks, 5,354 images total.
- Built a dataset-exploration script that verified structure, counted images per category and defect type, checked resolution/color channels, and flagged corrupted files.
- Preprocessed the full dataset — images resized to 256×256, masks resized with `INTER_NEAREST`, corrupted files skipped, original folder structure preserved.
- Selected and configured **PatchCore** (Anomalib framework) — a Wide ResNet50-2 backbone, features from Layers 2 & 3, coreset sampling ratio 0.1, k=9 nearest neighbours. PatchCore only needs normal (defect-free) images to train, so it doesn't require large labeled-defect datasets.
- Trained and validated the full pipeline end-to-end on the **Bottle** category as a proof of concept — correctly scored a normal image at 0.2267 and a defective image at 0.942, generating anomaly heatmaps and predicted defect masks for both. Diagnosed and fixed a duplicate-normalization bug along the way.

### Database (Arnab)

- Designed a **5-table PostgreSQL schema**: `users`, `inspections`, `defects`, `quality_decisions`, `reports`, covering the full workflow from user → inspection → defect detection → quality decision.
- Built SQLAlchemy models and a connection layer (credentials via environment variables) so the backend can integrate without touching raw SQL.
- Implemented the severity-scoring formula directly in the data model, not just as documentation.
- Verified schema creation in pgAdmin 4 and pushed the module to GitHub with full documentation (`DATABASE_SCHEMA.md`).
- Also preprocessed 5 dataset categories (hazelnut, leather, metal_nut, pill, screw) earlier in the milestone.

### Backend / API (Lakshyatha)

- Built a modular **Flask** backend with **12 REST endpoints** covering auth (register/login/me), image upload, inspection CRUD, analytics, history, and dataset browsing.
- Implemented JWT authentication with 24-hour token expiry.
- Scaffolded the AI-integration service layer (inference, image processing, quality control, severity scoring) ahead of the model being connected, so integration is a drop-in step later.
- Wrote an automated **Pytest suite** — 10/10 tests passing — covering auth and inspection flows.
- Documented the API contract for frontend integration.

### Frontend (Himabindhu)

- Built the full UI in **React (Vite) + Tailwind CSS**: login with role selection (Quality Engineer / Factory Supervisor), single & batch image upload with preview, an inspection dashboard (total/passed/failed/critical stats), a history table, and an analytics placeholder.
- Connected real JWT login to the backend's auth API.
- Used the team's real severity-scoring formula for mock inspection results (since the AI model isn't wired in yet), so the UI already behaves correctly.
- Isolated all backend calls into a single `api.js` file — swapping mock data for the live model/API later needs one file changed, not a page rewrite.

### Coordination & Documentation (Om Shakthi)

- Drove early task division across the four technical layers and sourced the full MVTec AD dataset for the team.
- Supported teammates as a floating resource once core modules were assigned.
- Consolidated all four individual write-ups into unified project documentation (this README, a full Milestone-1 report, and a presentation deck for mentor review).

### Milestone 1 Status

| Requirement | Status |
|---|---|
| Architecture & folder structure | ✅ Done |
| Database schema | ✅ Done |
| Backend REST API + JWT auth | ✅ Done |
| Image upload (single & batch) | ✅ Done |
| Inspection dashboard (UI) | ✅ Done |
| Dataset load & preprocessing (all 15 categories) | ✅ Done |
| Anomaly-detection model — proof of concept | ✅ Done (Bottle category) |
| Role-based access control enforcement | ⏳ Pending |

---

## What's Next

Milestone 2 onward is about **connecting** what each module already does on its own into one live system, then extending it:

- Train the PatchCore model across all 15 categories and generate real defect predictions (not just Bottle).
- Replace the frontend's mock inspection results with live calls to the trained model through the backend.
- Finalize role-based access control (e.g. whether Factory Supervisors can upload or only view).
- Deploy the database to a managed cloud PostgreSQL instance.
- Build out real defect-classification workflows, severity/quality-risk reporting, and manufacturing analytics dashboards (Milestone 3).
- Test, containerize (Docker), deploy to cloud, and finalize documentation for a live demo (Milestone 4).
