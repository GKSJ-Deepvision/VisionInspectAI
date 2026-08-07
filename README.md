# VisionInspect AI

## Overview

VisionInspect AI is an AI-powered manufacturing quality inspection system that detects product defects using computer vision and deep learning.

The system allows users to upload product images, performs AI-based defect detection using a trained ResNet18 model, and displays the prediction with a confidence score through an interactive web application.

The system also provides inspection history, analytics, severity analysis, defect type analysis, and report generation to support manufacturing quality control.

---

## Features

### Authentication

* User Registration
* User Login
* JWT-based Authentication
* Secure Password Handling
* Protected Application Workflow

### AI-Based Inspection

* Product Image Upload
* Image Validation and Processing
* AI-based Defect Detection
* GOOD / DEFECT Prediction
* Confidence Score
* Inspection Result Display

### Dashboard

* Total Inspections
* Good Products
* Defective Products
* Quality Score
* Manufacturing Analytics
* Inspection Overview

### Inspection Management

* Inspection History
* Inspection Record Display
* Prediction Details
* Confidence Information
* Inspection Time Tracking
* Image Preview

### Analytics

* Good vs Defective Products
* Prediction Confidence Analysis
* Inspection Trend Analysis
* Severity Distribution
* Defect Type Distribution
* Quality Statistics

### Reports

* PDF Report Export
* CSV Export
* Excel Export

### User Interface

* React-based Dashboard
* Responsive Layout
* Sidebar Navigation
* Top Navigation
* Prediction Page
* History Page
* Analytics Page
* Reports Page
* Profile Page
* Loading States
* Image Preview
* Quick Actions
* System Status

---

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication
* Uvicorn
* Python

### AI & Machine Learning

* PyTorch
* ResNet18
* Torchvision
* Pillow
* OpenCV

### Frontend

* React
* Axios
* React Router
* Tailwind CSS
* Recharts
* Lucide React

### Database

* PostgreSQL
* SQLAlchemy ORM

### Dataset

* MVTec AD Dataset
* Current Working Category: **Bottle**

The current working AI model is demonstrated using the Bottle category. Support for additional manufacturing categories is planned as a future enhancement.

---

# System Architecture

```text
React Frontend
       │
       ▼
Axios API Communication
       │
       ▼
FastAPI Backend
       │
       ├───────────────┐
       ▼               ▼
Inspection API     Authentication API
       │               │
       ▼               ▼
AI Prediction      JWT Security
Service
       │
       ▼
ResNet18 Model
       │
       ▼
Prediction + Confidence
       │
       ▼
PostgreSQL Database
       │
       ▼
History / Analytics / Reports
```

---

# Project Workflow

```text
User Login
     │
     ▼
Dashboard
     │
     ▼
Upload Product Image
     │
     ▼
Image Validation
     │
     ▼
AI Prediction Service
     │
     ▼
ResNet18 Model
     │
     ▼
GOOD / DEFECT Prediction
     │
     ▼
Confidence Score
     │
     ▼
Store Inspection Result
     │
     ▼
PostgreSQL Database
     │
     ├──────────────► Inspection History
     │
     ├──────────────► Analytics
     │
     └──────────────► Reports
```

---

# Project Structure

```text
VisionInspectAI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── inspection.py
│   │   │   └── user.py
│   │   │
│   │   ├── core/
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── inspection.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── inspection.py
│   │   │
│   │   ├── services/
│   │   │   ├── prediction_service.py
│   │   │   └── inspection_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── scripts/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActionButtons.jsx
│   │   │   ├── AnalyticsChart.jsx
│   │   │   ├── DefectTypeChart.jsx
│   │   │   ├── ExportCSV.jsx
│   │   │   ├── ExportExcel.jsx
│   │   │   ├── ExportReport.jsx
│   │   │   ├── HistoryTable.jsx
│   │   │   ├── ImagePreviewModal.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PredictionCard.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   ├── SeverityChart.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── SystemStatus.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   └── UploadCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Predict.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── docs/
│   └── Progress_Report.md
│
├── .gitignore
└── README.md
```

---

# Milestone 1

## Completed Tasks

* Project Initialization
* Backend Setup using FastAPI
* Frontend Setup using React
* PostgreSQL Database Setup
* JWT Authentication
* User Registration and Login
* MVTec AD Dataset Setup
* Bottle Category Dataset Integration
* Image Upload Workflow
* Initial Inspection Dashboard

---

# Milestone 2

## Completed Tasks

* Image Preprocessing
* Image Quality Analysis
* AI Model Integration using ResNet18
* Defect Prediction API
* Inspection History
* Dashboard Analytics
* Monitoring Dashboard
* Backend and AI Integration

---

# Milestone 3

## Completed Tasks

### Frontend Development

* Redesigned Dashboard
* Prediction Page
* History Page
* Analytics Page
* Reports Page
* Profile Page
* Sidebar Navigation
* Topbar Navigation
* Loading Screen
* Quick Actions
* System Status
* Image Preview
* Improved UI/UX

### Analytics

* Good vs Defective Product Analysis
* Confidence Analysis
* Inspection Trend
* Severity Distribution
* Defect Type Distribution
* Quality Statistics
* Category-based analytics structure

### Inspection Management

* Improved Inspection History
* Prediction Result Display
* Confidence Display
* Inspection Information
* Image Preview
* Refresh and record management

### Report Generation

* PDF Report
* CSV Export
* Excel Export

### Backend Integration

* Inspection API Improvements
* User API
* Inspection Schemas
* Inspection Service
* Authentication Improvements
* Security Improvements
* Prediction Service Integration
* PostgreSQL Integration
* Frontend-Backend API Integration

---

# Current System Status

| Module                       | Status                    |
| ---------------------------- | ------------------------- |
| User Registration            | ✅ Completed               |
| User Login                   | ✅ Completed               |
| JWT Authentication           | ✅ Completed               |
| Image Upload                 | ✅ Completed               |
| AI Prediction                | ✅ Completed               |
| ResNet18 Integration         | ✅ Completed               |
| PostgreSQL Integration       | ✅ Completed               |
| Inspection History           | ✅ Completed               |
| Dashboard                    | ✅ Completed               |
| Analytics                    | ✅ Completed               |
| Severity Analysis            | ✅ Completed               |
| Defect Type Analysis         | ✅ Completed               |
| PDF Reports                  | ✅ Completed               |
| CSV Export                   | ✅ Completed               |
| Excel Export                 | ✅ Completed               |
| Profile                      | ✅ Completed               |
| Frontend-Backend Integration | ✅ Completed               |
| Bottle Dataset               | ✅ Current Working Dataset |
| Multiple Product Categories  | 🔄 Future Enhancement     |

---

# My Contribution

**Role:** Full Stack Developer – Backend, AI Integration & Frontend

This project was developed individually.

Responsibilities included:

* Developed REST APIs using FastAPI
* Implemented JWT Authentication
* Connected PostgreSQL using SQLAlchemy
* Developed user and inspection services
* Integrated the trained ResNet18 model
* Developed image upload and prediction workflow
* Implemented prediction and inspection APIs
* Stored inspection results in PostgreSQL
* Integrated backend APIs with the React frontend
* Developed the main Dashboard
* Developed Prediction, History, Analytics, Reports, and Profile pages
* Implemented analytics charts and visualizations
* Implemented PDF, CSV, and Excel report export
* Improved UI/UX and responsive layout
* Performed application testing and debugging
* Integrated and tested the complete end-to-end workflow

---

# Future Improvements

* Train and integrate models for additional MVTec AD categories
* Support multiple manufacturing product categories
* Add category selection before inspection
* Add category-wise AI prediction
* Improve model accuracy and validation
* Add more advanced defect classification
* Improve UI/UX
* Add Role-Based Access Control (RBAC)
* Add production-level monitoring
* Deploy the application to the cloud
* Add advanced manufacturing analytics

---

# Current Dataset Scope

The current working AI implementation uses the **Bottle category from the MVTec AD dataset**.

The Bottle dataset was used to develop and validate the complete inspection workflow, including:

```text
Image Upload
     ↓
Image Processing
     ↓
AI Prediction
     ↓
Confidence Score
     ↓
Database Storage
     ↓
History
     ↓
Analytics
     ↓
Report Generation
```

The next development phase will extend the system to additional manufacturing categories.

---

# Status

✅ Milestone 1 Completed

✅ Milestone 2 Completed

✅ Milestone 3 Completed

🔄 Multi-Category Dataset Support – Future Enhancement

---

# Author

**Milind Dhangar**

Full Stack Developer – Backend, AI Integration & Frontend

**VisionInspect AI**
