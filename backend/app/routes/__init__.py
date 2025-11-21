"""
Initialize routes package
"""

from .auth import router as auth_router
from .interview import router as interview_router
from .dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "interview_router",
    "dashboard_router",
]
