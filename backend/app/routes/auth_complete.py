"""
Authentication Routes (Complete Module)
Endpoints: /register, /login, /refresh, /me, /logout, /google, /google/callback
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token, RefreshTokenRequest
from app.utils.jwt import hash_password, verify_password, create_access_token, create_refresh_token, get_user_from_token
from app.utils.oauth import get_google_oauth_url, exchange_google_code, get_google_user_info
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# ========================================
# Standard Email/Password Authentication
# ========================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email and password.
    
    - **email**: Valid email address (will be validated)
    - **password**: Minimum 8 characters (hashed with bcrypt)
    - **full_name**: User's full name (optional)
    
    Password is automatically hashed using bcrypt with salt rounds.
    Returns user profile without sensitive data.
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login or use a different email."
        )
    
    # Validate password strength (additional check)
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Create new user with hashed password
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_pwd,
        full_name=user_data.full_name,
        role="user",  # Default role
        is_active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"New user registered: {new_user.email}")
    return new_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Login with email and password.
    
    - **email**: Registered email address
    - **password**: User's password (will be verified against bcrypt hash)
    
    Returns:
    - **access_token**: JWT token valid for 30 minutes
    - **refresh_token**: JWT token valid for 7 days
    - **token_type**: Always "bearer"
    
    Use access_token in Authorization header: "Bearer <token>"
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support."
        )
    
    # Verify password using bcrypt
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT tokens
    access_token = create_access_token(data={
        "sub": str(user.id), 
        "email": user.email,
        "role": user.role
    })
    refresh_token = create_refresh_token(data={
        "sub": str(user.id)
    })
    
    logger.info(f"User logged in: {user.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 1800  # 30 minutes in seconds
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate a new access token using a valid refresh token.
    
    - **refresh_token**: Valid refresh token from login
    
    The refresh token remains valid until expiration (7 days).
    Use this endpoint when access token expires to get a new one without re-login.
    """
    user = await get_user_from_token(token_data.refresh_token, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is still active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Generate new access token
    access_token = create_access_token(data={
        "sub": str(user.id), 
        "email": user.email,
        "role": user.role
    })
    
    logger.info(f"Token refreshed for user: {user.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": token_data.refresh_token,  # Return same refresh token
        "token_type": "bearer",
        "expires_in": 1800
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_user_from_token)):
    """
    Get the currently authenticated user's profile.
    
    Requires valid JWT access token in Authorization header:
    ```
    Authorization: Bearer <access_token>
    ```
    
    Returns complete user profile including:
    - User ID, email, full name
    - Account role and status
    - Profile metadata
    - Account timestamps
    """
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_user_from_token)):
    """
    Logout current user.
    
    Note: JWT tokens are stateless, so this is a client-side operation.
    The client should:
    1. Delete the access_token from storage
    2. Delete the refresh_token from storage
    3. Redirect to login page
    
    For true token revocation, implement a token blacklist in Redis/database.
    """
    logger.info(f"User logged out: {current_user.email}")
    return {
        "message": "Logout successful. Please delete tokens from client storage.",
        "instructions": {
            "localStorage": "localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token');",
            "sessionStorage": "sessionStorage.clear();",
            "cookies": "document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'"
        }
    }


# ========================================
# Google OAuth 2.0 Authentication
# ========================================

@router.get("/google")
async def google_oauth_login(redirect_uri: str = None):
    """
    Initiate Google OAuth 2.0 login flow.
    
    - **redirect_uri**: (Optional) Custom redirect URI after authentication
    
    Returns authorization URL to redirect user to Google login page.
    
    Flow:
    1. Frontend redirects user to this URL
    2. User logs in with Google
    3. Google redirects back to /auth/google/callback
    4. Backend exchanges code for tokens
    5. Frontend receives JWT tokens
    
    Example usage:
    ```javascript
    const response = await fetch('/api/auth/google');
    const data = await response.json();
    window.location.href = data.authorization_url;
    ```
    """
    auth_url = get_google_oauth_url(redirect_uri)
    
    return {
        "authorization_url": auth_url,
        "message": "Redirect user to this URL to authenticate with Google"
    }


@router.get("/google/callback", response_model=Token)
async def google_oauth_callback(
    code: str,
    state: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Google OAuth callback after user authentication.
    
    This endpoint is called by Google after user authorizes the app.
    It exchanges the authorization code for an access token and creates/logs in the user.
    
    Query Parameters:
    - **code**: Authorization code from Google
    - **state**: (Optional) State parameter for CSRF protection
    
    Returns JWT access and refresh tokens for the application.
    """
    try:
        # Exchange authorization code for Google access token
        google_token = await exchange_google_code(code)
        
        # Get user info from Google
        user_info = await get_google_user_info(google_token)
        
        # Check if user exists
        result = await db.execute(
            select(User).where(User.email == user_info["email"])
        )
        user = result.scalar_one_or_none()
        
        if user:
            # Existing user - log them in
            logger.info(f"Google OAuth login: {user.email}")
        else:
            # New user - create account
            user = User(
                email=user_info["email"],
                full_name=user_info.get("name"),
                password_hash=hash_password(f"google_oauth_{user_info['id']}"),  # Random password
                role="user",
                is_active=True,
                profile_data={
                    "oauth_provider": "google",
                    "google_id": user_info["id"],
                    "picture": user_info.get("picture"),
                    "verified_email": user_info.get("verified_email", False)
                }
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            logger.info(f"New user registered via Google OAuth: {user.email}")
        
        # Generate JWT tokens for our application
        access_token = create_access_token(data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        })
        refresh_token = create_refresh_token(data={
            "sub": str(user.id)
        })
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 1800,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            }
        }
        
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to authenticate with Google: {str(e)}"
        )
