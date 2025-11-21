"""
Authentication Routes
Endpoints for user registration, login, and token management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token, MessageResponse
from app.utils.jwt import hash_password, verify_password, create_tokens


# Create router with prefix and tags
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.
    
    **Parameters:**
    - **email**: Valid email address (must be unique)
    - **password**: Minimum 8 characters, must contain digit and uppercase letter
    - **full_name**: User's full name (2-255 characters)
    - **phone**: Optional phone number
    
    **Returns:**
    - User object with id, email, full_name, timestamps, etc.
    
    **Raises:**
    - **400**: Email already registered
    - **422**: Validation error (invalid email, weak password, etc.)
    """
    
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = hash_password(user_data.password)
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        is_active=True,
        is_verified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Add to database
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login and receive JWT tokens.
    
    **Parameters:**
    - **email**: User's email address
    - **password**: User's password
    
    **Returns:**
    - **access_token**: JWT access token (expires in 60 minutes)
    - **refresh_token**: JWT refresh token (expires in 30 days)
    - **token_type**: Always "bearer"
    
    **Raises:**
    - **401**: Invalid credentials or inactive account
    """
    
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Create access and refresh tokens
    tokens = create_tokens(user_id=user.id, email=user.email)
    
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    **Parameters:**
    - **refresh_token**: Valid refresh token (JWT)
    
    **Returns:**
    - New access_token and refresh_token pair
    
    **Raises:**
    - **401**: Invalid or expired refresh token
    
    **Note:** This endpoint allows users to get a new access token without logging in again.
    """
    from app.utils.jwt import verify_token
    
    try:
        # Verify refresh token
        payload = verify_token(refresh_token)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new tokens
        tokens = create_tokens(user_id=user.id, email=user.email)
        
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    # This is a placeholder - in production, use proper dependency injection
    # from fastapi.security import HTTPBearer
    # token: str = Depends(HTTPBearer())
):
    """
    Get current authenticated user profile.
    
    **Headers:**
    - **Authorization**: Bearer {access_token}
    
    **Returns:**
    - Current user's profile information
    
    **Raises:**
    - **401**: Invalid or expired token
    - **404**: User not found
    
    **Note:** This is a placeholder. In production, implement proper token validation
    using FastAPI's security utilities (HTTPBearer dependency).
    
    **Example Implementation:**
    ```python
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    
    security = HTTPBearer()
    
    async def get_current_user_dependency(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        token = credentials.credentials
        user_id = get_user_id_from_token(token)
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    # Then use: user: User = Depends(get_current_user_dependency)
    ```
    """
    # Placeholder response
    # In production, extract user from JWT token
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Implement token validation dependency first"
    )


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout user (invalidate tokens).
    
    **Note:** With JWT, logout is typically handled client-side by deleting tokens.
    For server-side logout, implement a token blacklist using Redis.
    
    **Returns:**
    - Success message
    
    **Example Redis Blacklist Implementation:**
    ```python
    import redis
    from app.config import settings
    
    redis_client = redis.from_url(settings.REDIS_URL)
    
    # On logout:
    redis_client.setex(
        f"blacklist:{token}",
        settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "1"
    )
    
    # On token validation:
    if redis_client.exists(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    ```
    """
    return {
        "message": "Logged out successfully. Please delete tokens from client.",
        "success": True
    }


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user's email address using verification token.
    
    **Parameters:**
    - **token**: Email verification token (sent via email)
    
    **Returns:**
    - Success message
    
    **Raises:**
    - **400**: Invalid or expired token
    
    **Note:** Implement email sending service to send verification emails on registration.
    """
    # TODO: Implement email verification logic
    # 1. Decode verification token
    # 2. Find user by email from token
    # 3. Update user.is_verified = True
    # 4. Commit to database
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Email verification not yet implemented"
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset email.
    
    **Parameters:**
    - **email**: User's registered email address
    
    **Returns:**
    - Success message (always returns success for security)
    
    **Note:** For security, always return success even if email doesn't exist.
    Implement email service to send password reset links.
    """
    # TODO: Implement password reset logic
    # 1. Check if user exists
    # 2. Generate password reset token
    # 3. Send email with reset link
    # 4. Store token in Redis with expiration
    
    return {
        "message": "If the email exists, a password reset link has been sent.",
        "success": True
    }
