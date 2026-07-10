from routes.auth import router as auth_router
from routes.images import router as images_router
from routes.dashboard import router as dashboard_router
from routes.reports import router as reports_router

__all__ = [
    "auth_router",
    "images_router",
    "dashboard_router",
    "reports_router"
]
