from enum import Enum
from typing import Set


class UserRole(str, Enum):
    ADMIN = "admin"
    QUALITY_ENGINEER = "quality_engineer"
    FACTORY_SUPERVISOR = "factory_supervisor"


class Permission(str, Enum):
    # Admin Permissions
    CREATE_USERS = "create_users"
    DELETE_USERS = "delete_users"
    VIEW_ALL_REPORTS = "view_all_reports"
    MANAGE_ROLES = "manage_roles"
    
    # Quality Engineer Permissions
    UPLOAD_IMAGES = "upload_images"
    START_INSPECTION = "start_inspection"
    VIEW_OWN_REPORTS = "view_own_reports"
    
    # Factory Supervisor Permissions
    VIEW_DASHBOARD = "view_dashboard"
    VIEW_REPORTS = "view_reports"
    VIEW_PRODUCTION_ANALYTICS = "view_production_analytics"


# Mapping from UserRole to their allowed set of permissions
ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    UserRole.ADMIN: {
        Permission.CREATE_USERS,
        Permission.DELETE_USERS,
        Permission.VIEW_ALL_REPORTS,
        Permission.MANAGE_ROLES,
    },
    UserRole.QUALITY_ENGINEER: {
        Permission.UPLOAD_IMAGES,
        Permission.START_INSPECTION,
        Permission.VIEW_OWN_REPORTS,
    },
    UserRole.FACTORY_SUPERVISOR: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_REPORTS,
        Permission.VIEW_PRODUCTION_ANALYTICS,
    }
}
