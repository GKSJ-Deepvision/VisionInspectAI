import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class UserRole(str, enum.Enum):
    CLIENT = "CLIENT"
    OPERATOR = "OPERATOR"
    ENGINEER = "ENGINEER"
    OWNER = "OWNER"
    ADMIN = "ADMIN"

class SeverityLevel(str, enum.Enum):
    NONE = "NONE"
    LOW = "LOW"
    MINOR = "MINOR"
    MEDIUM = "MEDIUM"
    MAJOR = "MAJOR"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class InspectionStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default=UserRole.OWNER.value, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    target_pass_rate = Column(Float, default=98.5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InspectionRecord(Base):
    __tablename__ = "inspection_records"
    
    inspection_id = Column(String, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_sku = Column(String, nullable=True, default="MVI-PROD-2026")
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    raw_image_path = Column(String, nullable=True)
    processed_image_path = Column(String, nullable=True)
    heatmap_image_path = Column(String, nullable=True)
    image_format = Column(String, nullable=True, default="JPEG")
    resolution = Column(String, nullable=True, default="256x256")
    image_resolution = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True, default=0)
    file_size_kb = Column(Float, nullable=True, default=0.0)
    dimensions = Column(String, nullable=True)
    
    camera_id = Column(String, nullable=True, default="CAM-01")
    conveyor_id = Column(String, nullable=True, default="LINE-01")
    line_id = Column(String, nullable=True, default="LINE-01")
    station_id = Column(String, nullable=True, default="STATION-01")
    batch_id = Column(String, nullable=True, default="BATCH-2026")
    shift = Column(String, nullable=True, default="MORNING")
    shift_id = Column(String, nullable=True)
    status = Column(String, nullable=True, default="COMPLETED")
    notes = Column(String, nullable=True)
    
    pass_fail_decision = Column(String, nullable=False)
    is_defective = Column(Boolean, default=False)
    defect_type = Column(String, nullable=True, default="None")
    confidence_score = Column(Float, nullable=True, default=0.0)
    recommendation = Column(String, nullable=True)
    
    severity_level = Column(String, nullable=True, default="LOW")
    severity_score = Column(Float, nullable=True, default=0.0)
    overall_severity_score = Column(Float, nullable=True, default=0.0)
    size_score = Column(Float, nullable=True, default=0.0)
    location_score = Column(Float, nullable=True, default=0.0)
    type_score = Column(Float, nullable=True, default=0.0)
    confidence_param_score = Column(Float, nullable=True, default=0.0)

    # Added fields for upgraded ml_engine
    defect_regions = Column(String, nullable=True)
    texture_score = Column(Float, nullable=True, default=0.0)
    edge_density_score = Column(Float, nullable=True, default=0.0)
    color_uniformity_score = Column(Float, nullable=True, default=0.0)
    matched_category = Column(String, nullable=True, default="unknown")
    
    latency_ms = Column(Float, nullable=True, default=0.0)
    processing_latency_ms = Column(Float, nullable=True, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # UNIVERSAL SANITIZER
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(value, 'value'):
                value = value.value
            if hasattr(self.__class__, key):
                setattr(self, key, value)

    @property
    def id(self):
        return self.inspection_id

Inspection = InspectionRecord