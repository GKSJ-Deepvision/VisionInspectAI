"""
VisionInspect AI - Database Models (SQLAlchemy)
--------------------------------------------------
These classes mirror the tables defined in schema.sql, but written as
Python objects so the Flask backend can work with them easily
(e.g. Inspection.query.filter_by(category="hazelnut").all()
instead of writing raw SQL every time).

Uses the same `db` object created in connection.py.
"""

from datetime import datetime
from database.connection import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, default="quality_engineer")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One user -> many inspections
    inspections = db.relationship("Inspection", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class Inspection(db.Model):
    __tablename__ = "inspections"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)          # e.g. 'hazelnut'
    image_path = db.Column(db.String(500), nullable=False)
    processed_path = db.Column(db.String(500))
    status = db.Column(db.String(20), nullable=False, default="pending")
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    # One inspection -> many defects
    defects = db.relationship("Defect", backref="inspection", lazy=True, cascade="all, delete-orphan")
    # One inspection -> one quality decision
    quality_decision = db.relationship(
        "QualityDecision", backref="inspection", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Inspection {self.id} - {self.category} - {self.status}>"


class Defect(db.Model):
    __tablename__ = "defects"

    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), nullable=False)
    defect_type = db.Column(db.String(100), nullable=False)      # e.g. 'crack', 'scratch'
    size_score = db.Column(db.Numeric(5, 2), nullable=False)
    location_score = db.Column(db.Numeric(5, 2), nullable=False)
    type_score = db.Column(db.Numeric(5, 2), nullable=False)
    confidence_score = db.Column(db.Numeric(5, 2), nullable=False)
    severity_score = db.Column(db.Numeric(5, 2), nullable=False)
    severity_level = db.Column(db.String(20), nullable=False)    # Critical / High / Medium / Low
    heatmap_path = db.Column(db.String(500))
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Defect {self.defect_type} - {self.severity_level}>"

    @staticmethod
    def calculate_severity(size, location, defect_type_score, confidence):
        """
        Implements the Overall Severity Formula from the project spec:
        Severity Score = (Size x 30%) + (Location x 25%) + (Defect Type x 25%) + (Confidence x 20%)
        """
        return round(
            (size * 0.30) + (location * 0.25) + (defect_type_score * 0.25) + (confidence * 0.20),
            2,
        )

    @staticmethod
    def severity_level_from_score(score):
        """Maps a numeric severity score to its severity level label."""
        if score >= 80:
            return "Critical"
        elif score >= 60:
            return "High"
        elif score >= 40:
            return "Medium"
        else:
            return "Low"


class QualityDecision(db.Model):
    __tablename__ = "quality_decisions"

    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), unique=True, nullable=False)
    decision = db.Column(db.String(20), nullable=False)          # Pass / Fail / Rework
    recommended_action = db.Column(db.Text)
    decided_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<QualityDecision {self.decision}>"


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    report_date = db.Column(db.Date, default=datetime.utcnow)
    total_inspections = db.Column(db.Integer, default=0)
    total_defects = db.Column(db.Integer, default=0)
    pass_count = db.Column(db.Integer, default=0)
    fail_count = db.Column(db.Integer, default=0)
    rework_count = db.Column(db.Integer, default=0)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.report_date}>"
