# VisionInspect AI

## Overview

VisionInspect AI is an AI-powered manufacturing quality inspection system that detects product defects using computer vision and deep learning. The system allows users to upload product images, performs AI-based defect detection, and displays the prediction with a confidence score through an interactive dashboard.

---

## Features

- User Registration & Login (JWT Authentication)
- Secure Authentication using JWT Tokens
- Image Upload for Inspection
- AI-based Defect Detection
- Prediction with Confidence Score
- Inspection History
- Dashboard Analytics
- PostgreSQL Database Integration
- REST APIs using FastAPI

---

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Uvicorn

### AI & Machine Learning
- PyTorch
- ResNet18
- Torchvision
- Pillow
- OpenCV

### Frontend
- React
- Axios
- Tailwind CSS
- React Router

### Dataset
- MVTec AD Dataset
- Category Used: **Bottle**

---

# Project Structure

```
VisionInspectAI/
│
├── backend/
│   ├── app/
│   ├── scripts/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── docs/
│   └── Progress_Report.md
│
└── README.md
```

---

# Workflow

```
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Image Upload API
        │
        ▼
ResNet18 AI Model
        │
        ▼
Prediction
        │
        ▼
PostgreSQL Database
        │
        ▼
Dashboard
```

---

# Milestone 1

## Completed Tasks

- Project Initialization
- Backend Setup (FastAPI)
- Frontend Setup (React)
- PostgreSQL Database Setup
- JWT Authentication
- User Registration & Login
- Dataset Loading (MVTec AD)
- Image Upload Workflow
- Inspection Dashboard

---

# Milestone 2

## Completed Tasks

- Image Preprocessing
- Image Quality Analysis
- AI Model Integration (ResNet18)
- Defect Prediction API
- Inspection History
- Dashboard Analytics
- Monitoring Dashboard

---

# My Contribution

**Role:** Backend & AI Integration Engineer

Responsibilities:

- Developed REST APIs using FastAPI
- Implemented JWT Authentication
- Connected PostgreSQL using SQLAlchemy
- Integrated the trained ResNet18 model
- Built Image Upload & Prediction APIs
- Stored prediction history in PostgreSQL
- Connected backend APIs with the React frontend

---

# Future Improvements

- Train the model on additional MVTec AD categories
- Improve the UI/UX
- Deploy the application to the cloud
- Add Role-Based Access Control (RBAC)
- Support multiple product categories

---

# Status

✅ Milestone 1 Completed

✅ Milestone 2 Completed

---

# Author

**Milind Dhangar**

Backend & AI Integration