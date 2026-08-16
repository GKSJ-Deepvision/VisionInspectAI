-- ============================================================
-- VisionInspect AI - Database Schema (PostgreSQL)
-- ============================================================
-- This file defines the database structure for the VisionInspect AI
-- manufacturing defect detection & quality inspection platform.
--
-- Covers:
--   1. users              - login accounts (quality engineers, supervisors)
--   2. inspections        - each uploaded image / inspection job
--   3. defects            - defects detected within an inspection
--   4. quality_decisions  - final pass/fail decision per inspection
--   5. reports            - daily/summary analytics (optional, for dashboard)
--
-- Usage: run this file once against your PostgreSQL database, e.g.
--   psql -U postgres -d visioninspect_db -f schema.sql
-- ============================================================


-- Drop tables if they already exist (safe re-run during development)
DROP TABLE IF EXISTS quality_decisions CASCADE;
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ============================================================
-- 1. USERS TABLE
-- Stores login accounts and their role in the system.
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,          -- store hashed password only, never plain text
    role            VARCHAR(30)   NOT NULL DEFAULT 'quality_engineer',
                     -- allowed values (enforce in application code):
                     -- 'quality_engineer', 'factory_supervisor', 'production_manager', 'admin'
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. INSPECTIONS TABLE
-- One row per uploaded product image that goes through inspection.
-- ============================================================
CREATE TABLE inspections (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        VARCHAR(50)   NOT NULL,          -- e.g. 'hazelnut', 'bottle', 'screw'
    image_path      VARCHAR(500)  NOT NULL,          -- path/URL to the uploaded (original) image
    processed_path  VARCHAR(500),                    -- path to the preprocessed version of the image
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending',
                     -- allowed values: 'pending', 'processing', 'completed', 'failed'
    uploaded_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP
);

CREATE INDEX idx_inspections_user_id  ON inspections(user_id);
CREATE INDEX idx_inspections_category ON inspections(category);
CREATE INDEX idx_inspections_status   ON inspections(status);


-- ============================================================
-- 3. DEFECTS TABLE
-- One row per defect detected within an inspection.
-- (An inspection can have zero, one, or multiple defects.)
-- ============================================================
CREATE TABLE defects (
    id                  SERIAL PRIMARY KEY,
    inspection_id       INTEGER       NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    defect_type         VARCHAR(100)  NOT NULL,      -- e.g. 'crack', 'scratch', 'contamination'
    size_score          NUMERIC(5,2)  NOT NULL CHECK (size_score BETWEEN 0 AND 100),
    location_score      NUMERIC(5,2)  NOT NULL CHECK (location_score BETWEEN 0 AND 100),
    type_score          NUMERIC(5,2)  NOT NULL CHECK (type_score BETWEEN 0 AND 100),
    confidence_score    NUMERIC(5,2)  NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    severity_score      NUMERIC(5,2)  NOT NULL CHECK (severity_score BETWEEN 0 AND 100),
                         -- severity_score = size*0.30 + location*0.25 + type*0.25 + confidence*0.20
    severity_level      VARCHAR(20)   NOT NULL,
                         -- allowed values: 'Critical', 'High', 'Medium', 'Low'
    heatmap_path        VARCHAR(500),                -- path to defect heatmap / visualization image
    detected_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_defects_inspection_id ON defects(inspection_id);
CREATE INDEX idx_defects_severity      ON defects(severity_level);


-- ============================================================
-- 4. QUALITY_DECISIONS TABLE
-- Final pass/fail/rework decision for each inspection.
-- ============================================================
CREATE TABLE quality_decisions (
    id                  SERIAL PRIMARY KEY,
    inspection_id       INTEGER       NOT NULL UNIQUE REFERENCES inspections(id) ON DELETE CASCADE,
    decision            VARCHAR(20)   NOT NULL,      -- allowed values: 'Pass', 'Fail', 'Rework'
    recommended_action  TEXT,                        -- e.g. 'Reject product and trigger inspection workflow'
    decided_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. REPORTS TABLE (optional - powers the analytics dashboard)
-- Aggregated daily/summary statistics.
-- ============================================================
CREATE TABLE reports (
    id                  SERIAL PRIMARY KEY,
    report_date         DATE          NOT NULL DEFAULT CURRENT_DATE,
    total_inspections   INTEGER       NOT NULL DEFAULT 0,
    total_defects       INTEGER       NOT NULL DEFAULT 0,
    pass_count          INTEGER       NOT NULL DEFAULT 0,
    fail_count          INTEGER       NOT NULL DEFAULT 0,
    rework_count        INTEGER       NOT NULL DEFAULT 0,
    generated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- Sample seed data (optional - useful for quick local testing)
-- Comment out or remove before using in production
-- ============================================================

-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Arnab Ghosal', 'arnab@example.com', 'hashed_password_here', 'quality_engineer');

-- INSERT INTO inspections (user_id, category, image_path, status)
-- VALUES (1, 'hazelnut', '/uploads/original/hazelnut_001.png', 'completed');

-- INSERT INTO defects (inspection_id, defect_type, size_score, location_score, type_score, confidence_score, severity_score, severity_level)
-- VALUES (1, 'crack', 85, 90, 95, 92, 88, 'Critical');

-- INSERT INTO quality_decisions (inspection_id, decision, recommended_action)
-- VALUES (1, 'Fail', 'Reject product and trigger quality inspection workflow');
