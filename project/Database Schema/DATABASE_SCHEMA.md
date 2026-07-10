# VisionInspect AI — Database Schema

This document describes the database design for the VisionInspect AI platform.

**Database engine:** PostgreSQL
**ORM used in backend:** SQLAlchemy (Flask)

---

## Overview

The database stores everything related to user accounts, uploaded product
images, detected defects, and final quality decisions. It is designed
around the platform's core workflow:

```
User uploads image → Inspection created → Defects detected → Severity scored → Quality decision made
```

---

## Entity Relationship Diagram (text form)

```
users (1) ────────< (many) inspections (1) ────────< (many) defects
                              │
                              │ (1)
                              ▼
                      quality_decisions (1)

reports  →  standalone table, aggregated analytics (not directly linked)
```

- One **user** can have many **inspections**.
- One **inspection** can have many **defects**.
- One **inspection** has exactly one **quality_decision**.
- **reports** stores daily/summary stats independently, used to power the analytics dashboard.

---

## Tables

### 1. `users`
Stores login accounts and roles.

| Column         | Type          | Notes                                            |
|----------------|---------------|---------------------------------------------------|
| id             | SERIAL (PK)   | Unique user ID                                     |
| name           | VARCHAR(100)  | Full name                                          |
| email          | VARCHAR(150)  | Unique, used for login                             |
| password_hash  | VARCHAR(255)  | Hashed password (never store plain text)           |
| role           | VARCHAR(30)   | 'quality_engineer', 'factory_supervisor', 'production_manager', 'admin' |
| created_at     | TIMESTAMP     | Account creation time                              |

---

### 2. `inspections`
One row per uploaded product image.

| Column          | Type          | Notes                                          |
|-----------------|---------------|-------------------------------------------------|
| id              | SERIAL (PK)   | Unique inspection ID                             |
| user_id         | INTEGER (FK)  | References `users.id`                            |
| category        | VARCHAR(50)   | Product category, e.g. 'hazelnut', 'bottle'      |
| image_path      | VARCHAR(500)  | Path/URL of the original uploaded image          |
| processed_path  | VARCHAR(500)  | Path of the preprocessed image                   |
| status          | VARCHAR(20)   | 'pending', 'processing', 'completed', 'failed'   |
| uploaded_at     | TIMESTAMP     | When the image was uploaded                      |
| completed_at    | TIMESTAMP     | When inspection finished                         |

---

### 3. `defects`
One row per defect found within an inspection (an inspection can have 0, 1, or many).

| Column             | Type           | Notes                                             |
|--------------------|----------------|------------------------------------------------------|
| id                 | SERIAL (PK)    | Unique defect ID                                      |
| inspection_id      | INTEGER (FK)   | References `inspections.id`                           |
| defect_type        | VARCHAR(100)   | e.g. 'crack', 'scratch', 'contamination'              |
| size_score         | NUMERIC(5,2)   | 0–100, defect size relative to product surface        |
| location_score     | NUMERIC(5,2)   | 0–100, criticality of defect's location               |
| type_score         | NUMERIC(5,2)   | 0–100, seriousness of the defect category             |
| confidence_score   | NUMERIC(5,2)   | 0–100, model's confidence in the detection             |
| severity_score     | NUMERIC(5,2)   | Weighted overall score (see formula below)             |
| severity_level     | VARCHAR(20)    | 'Critical' (80–100), 'High' (60–79), 'Medium' (40–59), 'Low' (0–39) |
| heatmap_path       | VARCHAR(500)   | Path to the defect heatmap/visualization image         |
| detected_at        | TIMESTAMP      | When the defect was detected                           |

**Severity Score Formula** (from project spec):
```
Severity Score = (Size × 30%) + (Location × 25%) + (Defect Type × 25%) + (Confidence × 20%)
```

---

### 4. `quality_decisions`
Final Pass/Fail/Rework decision for each inspection.

| Column              | Type          | Notes                                              |
|---------------------|---------------|-------------------------------------------------------|
| id                  | SERIAL (PK)   | Unique decision ID                                     |
| inspection_id       | INTEGER (FK)  | References `inspections.id` (one-to-one, unique)       |
| decision            | VARCHAR(20)   | 'Pass', 'Fail', 'Rework'                               |
| recommended_action  | TEXT          | e.g. "Reject product and trigger inspection workflow"  |
| decided_at          | TIMESTAMP     | When the decision was made                             |

---

### 5. `reports`
Aggregated statistics for the analytics dashboard (daily or on-demand summaries).

| Column             | Type   | Notes                                  |
|--------------------|--------|-------------------------------------------|
| id                 | SERIAL (PK) | Unique report ID                     |
| report_date        | DATE   | Date the report covers                    |
| total_inspections  | INTEGER | Total inspections that day               |
| total_defects      | INTEGER | Total defects detected that day          |
| pass_count         | INTEGER | Number of Pass decisions                 |
| fail_count         | INTEGER | Number of Fail decisions                 |
| rework_count       | INTEGER | Number of Rework decisions               |
| generated_at       | TIMESTAMP | When this report row was generated     |

---

## Files in this module

| File                          | Purpose                                              |
|-------------------------------|-------------------------------------------------------|
| `backend/database/schema.sql` | Raw SQL to create all tables directly in PostgreSQL   |
| `backend/database/connection.py` | Connects Flask app to PostgreSQL using SQLAlchemy |
| `backend/database/models.py`  | Python (SQLAlchemy) models mirroring the tables above |

Both `schema.sql` and `models.py` define the same structure — use **one or
the other** to actually create the tables (not both, to avoid conflicts):
- `schema.sql` → run manually via `psql` or pgAdmin
- `models.py` → tables auto-created when Flask app starts (via `db.create_all()` in `connection.py`)

---

## Setup Steps (Local Development)

1. Install PostgreSQL locally.
2. Create a database: `visioninspect_db`
3. Add a `.env` file in `backend/` with:
   ```
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=visioninspect_db
   ```
4. Install Python dependencies: `pip install flask-sqlalchemy python-dotenv psycopg2-binary`
5. Run the Flask app — tables will be created automatically via `init_db(app)`.

## Cloud Deployment (Later Step)

Once local setup works, the same schema can be deployed to a managed
PostgreSQL provider (e.g. Supabase, Render, Railway) by pointing the same
`.env` variables to the cloud database's connection details instead of
`localhost`.
