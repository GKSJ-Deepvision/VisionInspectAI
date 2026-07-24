from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    role: str

class InspectionResponse(BaseModel):
    inspection_id: str
    product_sku: str
    is_defective: bool
    defect_type: str
    confidence_score: float
    processing_latency_ms: float
    
    # Severity Scoring Parameters
    size_score: float
    location_score: float
    type_score: float
    confidence_param_score: float
    overall_severity_score: float
    severity_level: str
    
    # Quality Control Decision
    pass_fail_decision: str
    recommendation: str
    heatmap_image_path: Optional[str] = None
    
    # New fields
    defect_regions: Optional[str] = None
    texture_score: Optional[float] = None
    edge_density_score: Optional[float] = None
    color_uniformity_score: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class BatchInspectionResponse(BaseModel):
    batch_id: str
    results: List[InspectionResponse]

class AnalyticsSummary(BaseModel):
    total_inspections: int
    defect_rate: float
    avg_confidence: float
    avg_latency: float
    pass_rate: float

class DefectTrend(BaseModel):
    date: str
    defect_count: int

class SeverityDistribution(BaseModel):
    severity_level: str
    count: int

class ProductionQuality(BaseModel):
    date: str
    pass_rate: float
    fail_rate: float
