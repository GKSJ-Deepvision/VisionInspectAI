# Database Module — VisionInspect AI

**Contributor:** Arnab Ghosal
**Module:** Database Design & Setup (Milestone 1)

---

## What I Worked On

For Milestone 1, my responsibility was designing and setting up the database
for the VisionInspect AI platform. This included:

- Designing the database schema based on the project's core workflow
  (user → inspection → defect detection → quality decision)
- Creating the PostgreSQL database and all required tables
- Writing the SQLAlchemy models and connection layer so the Flask backend
  team could integrate with the database easily
- Documenting the full schema for the team

I also worked on dataset preprocessing earlier in the project — preprocessing
5 assigned MVTec AD categories (hazelnut, leather, metal_nut, pill, screw),
including resizing, denoising, and normalizing all training, testing, and
ground truth mask images.

---

## What I Built

### 1. Database Schema (`schema.sql`)
Designed 5 tables to cover the platform's full data flow:
- **users** — login accounts and roles (quality engineer, factory supervisor, etc.)
- **inspections** — every uploaded product image and its processing status
- **defects** — individual defects detected within an inspection, including
  the severity scoring fields (size, location, type, confidence, and final
  severity score/level)
- **quality_decisions** — the final Pass / Fail / Rework decision for each inspection
- **reports** — aggregated statistics to power the analytics dashboard

The severity score formula from the project spec is built directly into the
schema and logic:
```
Severity Score = (Size × 30%) + (Location × 25%) + (Defect Type × 25%) + (Confidence × 20%)
```

### 2. SQLAlchemy Models (`models.py`)
Python classes mirroring each table, so the backend team can query the
database using Python objects instead of raw SQL (e.g.
`Inspection.query.filter_by(category="hazelnut").all()`).

### 3. Database Connection (`connection.py`)
Handles connecting the Flask app to PostgreSQL using environment variables
(`.env`), so credentials aren't hardcoded and the same code can point to a
local database now and a cloud database later.

### 4. Documentation (`DATABASE_SCHEMA.md`)
Full write-up of every table, field, relationship, and the ER diagram, so
any team member can understand the database structure without reading the
raw SQL.

---

## Tools & Tech Used
- PostgreSQL (database engine)
- pgAdmin 4 (used to create the database and run schema.sql locally)
- SQLAlchemy (Python ORM for Flask integration)
- python-dotenv (for environment variable management)

---

## Status
- ✅ Schema designed and finalized
- ✅ Database created and tested locally in PostgreSQL (all 5 tables created successfully)
- ✅ Models and connection layer ready for backend integration
- ✅ Documentation completed
- ⏳ Cloud deployment (e.g. Render) — planned for a later milestone

---

## What I Learned
This was my first time working with PostgreSQL and designing a database
schema from scratch. I learned how to:
- Translate a product spec into relational tables with proper relationships
  (foreign keys, one-to-many, one-to-one)
- Use SQLAlchemy to bridge Python/Flask code with a SQL database
- Set up and query a PostgreSQL database locally using pgAdmin
