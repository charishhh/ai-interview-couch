"""
OAuth 2.0 Utilities
Google OAuth integration for social login
"""

import httpx
from urllib.parse import urlencode
from typing import Dict, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Google OAuth 2.0 URLs
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def get_google_oauth_url(redirect_uri: Optional[str] = None) -> str:
    """
    Generate Google OAuth authorization URL.
    
    Args:
        redirect_uri: Optional custom redirect URI
        
    Returns:
        Authorization URL to redirect user to
        
    Example:
        url = get_google_oauth_url()
        return RedirectResponse(url)
    """
    if not redirect_uri:
        redirect_uri = settings.GOOGLE_REDIRECT_URI
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join([
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]),
        "access_type": "offline",  # Get refresh token
        "prompt": "consent",  # Force consent screen to get refresh token
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    logger.info("Generated Google OAuth URL")
    return auth_url


async def exchange_google_code(code: str, redirect_uri: Optional[str] = None) -> str:
    """
    Exchange authorization code for access token.
    
    Args:
        code: Authorization code from Google callback
        redirect_uri: Redirect URI used in authorization request
        
    Returns:
        Google access token
        
    Raises:
        Exception: If token exchange fails
    """
    if not redirect_uri:
        redirect_uri = settings.GOOGLE_REDIRECT_URI
    
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        
        if response.status_code != 200:
            logger.error(f"Google token exchange failed: {response.text}")
            raise Exception(f"Failed to exchange code for token: {response.text}")
        
        token_response = response.json()
        logger.info("Successfully exchanged Google code for token")
        return token_response["access_token"]


async def get_google_user_info(access_token: str) -> Dict[str, any]:
    """
    Get user information from Google using access token.
    
    Args:
        access_token: Google access token
        
    Returns:
        Dictionary with user information:
        - id: Google user ID
        - email: User's email
        - verified_email: Whether email is verified
        - name: Full name
        - given_name: First name
        - family_name: Last name
        - picture: Profile picture URL
        
    Raises:
        Exception: If fetching user info fails
    """
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_USERINFO_URL, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to get Google user info: {response.text}")
            raise Exception(f"Failed to get user info: {response.text}")
        
        user_info = response.json()
        logger.info(f"Retrieved Google user info for: {user_info.get('email')}")
        return user_info


async def refresh_google_token(refresh_token: str) -> str:
    """
    Refresh Google access token using refresh token.
    
    Args:
        refresh_token: Google refresh token
        
    Returns:
        New access token
        
    Note: Only works if 'access_type=offline' was used during authorization
    """
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        
        if response.status_code != 200:
            logger.error(f"Google token refresh failed: {response.text}")
            raise Exception(f"Failed to refresh token: {response.text}")
        
        token_response = response.json()
        return token_response["access_token"]
