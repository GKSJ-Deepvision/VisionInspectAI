import logging
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError

from config import settings
from routes.auth import router as auth_router
from routes.images import router as images_router
from routes.dashboard import router as dashboard_router
from routes.reports import router as reports_router
from dependencies import get_current_user, RoleChecker, PermissionChecker
from models.user import User
from schemas.user import UserOut
from rbac import UserRole, Permission

# Setup logging configuration
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("visioninspect-api")

app = FastAPI(
    title="VisionInspect AI Backend API",
    description="Manufacturing Defect Detection & Quality Inspection System API",
    version="0.1.0"
)

# CORS configuration settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers for structured JSON responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Structured error response for standard HTTP exceptions.
    """
    logger.warning(f"HTTP error on path {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Structured error response for Pydantic input validation exceptions.
    """
    logger.warning(f"Validation error on path {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation failed.",
            "errors": exc.errors()
        }
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """
    Structured error response for database query exceptions.
    """
    logger.error(f"Database exception on path {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database operation error occurred. Contact administrator."}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Structured error response for uncaught internal server exceptions.
    """
    logger.error(f"Uncaught exception on path {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."}
    )


# Mount routers
app.include_router(auth_router)
app.include_router(images_router)
app.include_router(dashboard_router)
app.include_router(reports_router)

# Mount uploads directory to serve images statically
# This makes file:///home/user/visioninspect-ai/uploads accessible via http://localhost:8000/uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
def read_root():
    """
    Welcome endpoint.
    """
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "documentation": "/docs"
    }


@app.get("/users/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Sample protected endpoint.
    Returns the authenticated operator's account profile details.
    """
    return current_user


# RBAC Protected Test Routes

@app.get("/admin-only", response_model=UserOut)
def read_admin_only(current_user: User = Depends(RoleChecker([UserRole.ADMIN]))):
    """
    Endpoint restricted to users with the Admin role.
    """
    return current_user


@app.post("/inspections/start")
def start_inspection_endpoint(current_user: User = Depends(PermissionChecker(Permission.START_INSPECTION))):
    """
    Endpoint restricted to users holding the START_INSPECTION permission (Quality Engineers).
    """
    return {
        "message": "Inspection started successfully",
        "started_by": current_user.full_name,
        "role": current_user.role
    }


@app.get("/analytics")
def view_production_analytics_endpoint(current_user: User = Depends(PermissionChecker(Permission.VIEW_PRODUCTION_ANALYTICS))):
    """
    Endpoint restricted to users holding the VIEW_PRODUCTION_ANALYTICS permission (Factory Supervisors).
    """
    return {
        "message": "Production analytics data retrieved",
        "authorized_user": current_user.full_name,
        "role": current_user.role,
        "analytics": {
            "yield_rate": 94.2,
            "inspected_items": 1520,
            "defects_found": 88
        }
    }
