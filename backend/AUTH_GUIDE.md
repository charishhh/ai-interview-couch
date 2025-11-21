# Complete Authentication Guide

This guide covers the complete authentication system including registration, login, JWT tokens, refresh tokens, protected routes, Google OAuth, and frontend integration.

---

## Table of Contents

1. [Authentication Flow Overview](#authentication-flow-overview)
2. [API Endpoints](#api-endpoints)
3. [JWT Token System](#jwt-token-system)
4. [Protected Routes (Middleware)](#protected-routes-middleware)
5. [Google OAuth Integration](#google-oauth-integration)
6. [Frontend Integration](#frontend-integration)
7. [cURL Examples](#curl-examples)
8. [Security Best Practices](#security-best-practices)

---

## Authentication Flow Overview

### Standard Email/Password Flow

```
1. User Registration
   POST /api/auth/register
   → Email + Password → bcrypt hash → Store in database

2. User Login
   POST /api/auth/login
   → Verify password → Generate JWT tokens → Return to client

3. Access Protected Routes
   GET /api/auth/me (with Authorization: Bearer <token>)
   → Verify JWT → Extract user → Return data

4. Token Refresh
   POST /api/auth/refresh (with refresh_token)
   → Verify refresh token → Generate new access token
```

### Google OAuth Flow

```
1. Initiate OAuth
   GET /api/auth/google
   → Generate Google authorization URL → Redirect user

2. User Authorizes on Google
   User logs in with Google account

3. Google Callback
   GET /api/auth/google/callback?code=...
   → Exchange code for Google token → Get user info → Create/login user → Return JWT tokens

4. Use JWT Tokens
   Same as standard flow
```

---

## API Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "created_at": "2025-11-21T10:00:00Z",
  "updated_at": "2025-11-21T10:00:00Z"
}
```

**Password Requirements:**
- Minimum 8 characters
- Automatically hashed with bcrypt (10 rounds)
- Stored as `password_hash` in database

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Token Lifetimes:**
- **Access Token:** 30 minutes
- **Refresh Token:** 7 days

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Use Case:**
- When access token expires (after 30 minutes)
- Avoids requiring user to re-enter credentials
- Should be called automatically by frontend

---

### 4. Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "profile_data": {},
  "created_at": "2025-11-21T10:00:00Z",
  "updated_at": "2025-11-21T10:00:00Z"
}
```

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Logout successful. Please delete tokens from client storage.",
  "instructions": {
    "localStorage": "localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token');",
    "sessionStorage": "sessionStorage.clear();",
    "cookies": "document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'"
  }
}
```

**Note:** JWT tokens are stateless, so logout is a client-side operation.

---

### 6. Google OAuth Login

**Endpoint:** `GET /api/auth/google`

**Query Parameters:**
- `redirect_uri` (optional): Custom redirect URI

**Response (200 OK):**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "message": "Redirect user to this URL to authenticate with Google"
}
```

**Usage:**
Redirect user's browser to the `authorization_url`.

---

### 7. Google OAuth Callback

**Endpoint:** `GET /api/auth/google/callback`

**Query Parameters:**
- `code`: Authorization code from Google (automatic)
- `state`: CSRF protection token (optional)

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "full_name": "John Doe"
  }
}
```

**Note:** Google automatically redirects to this endpoint after user authorization.

---

## JWT Token System

### Token Structure

**Access Token Payload:**
```json
{
  "sub": "1",           // User ID
  "email": "user@example.com",
  "role": "user",
  "exp": 1700568600,    // Expiration timestamp
  "iat": 1700566800     // Issued at timestamp
}
```

**Refresh Token Payload:**
```json
{
  "sub": "1",           // User ID
  "exp": 1701171600,    // Expiration timestamp (7 days)
  "iat": 1700566800     // Issued at timestamp
}
```

### Token Generation (Backend)

Located in `backend/app/utils/jwt.py`:

```python
from jose import jwt
from datetime import datetime, timedelta
from app.config import settings

def create_access_token(data: dict) -> str:
    """Generate JWT access token (30 minutes)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Generate JWT refresh token (7 days)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt
```

### Token Verification

```python
from jose import jwt, JWTError
from app.config import settings

def verify_token(token: str) -> Optional[Dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None
```

---

## Protected Routes (Middleware)

### Dependency Function

All protected routes use `get_user_from_token` as a dependency:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.utils.jwt import verify_token

security = HTTPBearer()

async def get_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to extract and verify user from JWT token.
    
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: User = Depends(get_user_from_token)):
            return {"user": current_user.email}
    """
    token = credentials.credentials
    
    # Verify token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user ID
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Fetch user from database
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user
```

### Using Protected Routes

**Example 1: Simple Protected Endpoint**
```python
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_user_from_token)):
    """Requires authentication"""
    return {
        "user_id": current_user.id,
        "email": current_user.email
    }
```

**Example 2: Admin-Only Route**
```python
async def get_admin_user(current_user: User = Depends(get_user_from_token)) -> User:
    """Dependency for admin-only routes"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only endpoint"""
    # Delete user logic
    pass
```

**Example 3: Optional Authentication**
```python
from typing import Optional

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Returns user if authenticated, None otherwise"""
    if not credentials:
        return None
    
    try:
        return await get_user_from_token(credentials, db)
    except:
        return None

@router.get("/public")
async def public_endpoint(user: Optional[User] = Depends(get_optional_user)):
    """Public endpoint with optional personalization"""
    if user:
        return {"message": f"Welcome back, {user.full_name}!"}
    return {"message": "Welcome, guest!"}
```

---

## Google OAuth Integration

### Setup

1. **Create Google OAuth Credentials**

Visit [Google Cloud Console](https://console.cloud.google.com/):

```
1. Create a new project (or select existing)
2. Enable Google+ API
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Authorized redirect URIs:
   - http://localhost:8000/api/auth/google/callback (development)
   - https://yourdomain.com/api/auth/google/callback (production)
6. Copy Client ID and Client Secret
```

2. **Update .env File**

```env
# Google OAuth Settings
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

3. **OAuth Flow Implementation**

Located in `backend/app/utils/oauth.py`:

```python
import httpx
from urllib.parse import urlencode

async def get_google_oauth_url(redirect_uri: str = None) -> str:
    """Generate Google OAuth URL"""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri or settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

async def exchange_google_code(code: str) -> str:
    """Exchange authorization code for access token"""
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data=token_data
        )
        return response.json()["access_token"]

async def get_google_user_info(access_token: str) -> dict:
    """Get user info from Google"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers=headers
        )
        return response.json()
```

---

## Frontend Integration

### React/Next.js Example

#### 1. Token Storage

```typescript
// utils/auth.ts

export const AuthService = {
  // Store tokens in localStorage (or secure cookie for SSR)
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },
  
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },
  
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
};
```

#### 2. API Client with Auto-Refresh

```typescript
// utils/api.ts

import axios from 'axios';
import { AuthService } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor: Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt token refresh
        const refreshToken = AuthService.getRefreshToken();
        const response = await axios.post(
          'http://localhost:8000/api/auth/refresh',
          { refresh_token: refreshToken }
        );
        
        const { access_token, refresh_token } = response.data;
        AuthService.setTokens(access_token, refresh_token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        AuthService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

#### 3. Authentication Hooks

```typescript
// hooks/useAuth.ts

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { AuthService } from '../utils/auth';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      AuthService.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, refresh_token } = response.data;
    AuthService.setTokens(access_token, refresh_token);
    await fetchUser();
  };

  const register = async (email: string, password: string, fullName: string) => {
    await api.post('/auth/register', {
      email,
      password,
      full_name: fullName
    });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthService.clearTokens();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return { user, loading, login, register, logout };
};
```

#### 4. Login Component

```typescript
// components/LoginForm.tsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
      <button type="button" onClick={handleGoogleLogin}>
        Login with Google
      </button>
    </form>
  );
}
```

#### 5. Protected Route Component

```typescript
// components/ProtectedRoute.tsx

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

#### 6. Google OAuth Callback Handler

```typescript
// app/auth/google/callback/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/utils/auth';
import api from '@/utils/api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        router.push('/login?error=oauth_failed');
        return;
      }

      try {
        // Exchange code for tokens
        const response = await api.get(`/auth/google/callback?code=${code}`);
        const { access_token, refresh_token } = response.data;
        
        // Store tokens
        AuthService.setTokens(access_token, refresh_token);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/login?error=oauth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return <div>Completing Google login...</div>;
}
```

---

## cURL Examples

### 1. Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "full_name": "New User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'

# Save tokens from response
# access_token=eyJhbGc...
# refresh_token=eyJhbGc...
```

### 3. Access Protected Route

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 5. Start Google OAuth

```bash
curl -X GET http://localhost:8000/api/auth/google

# Response includes authorization_url
# Copy URL and open in browser
```

### 6. Test Protected Interview Endpoint

```bash
curl -X POST http://localhost:8000/api/interviews/start \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer Interview",
    "job_position": "Senior Backend Developer",
    "difficulty": "hard",
    "total_questions": 10
  }'
```

---

## Security Best Practices

### Backend

1. **Environment Variables**
   ```env
   # Use strong, random SECRET_KEY (minimum 32 characters)
   SECRET_KEY=your-super-secret-key-minimum-32-chars-long
   
   # Never commit .env file to version control
   # Add to .gitignore
   ```

2. **Password Hashing**
   ```python
   # bcrypt automatically handles salting
   # 10 rounds is default (good balance of security vs performance)
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   ```

3. **Token Expiration**
   - Access tokens: Short-lived (30 minutes)
   - Refresh tokens: Longer-lived (7 days)
   - Implement token blacklist for logout (optional, using Redis)

4. **HTTPS Only (Production)**
   ```python
   # Force HTTPS in production
   if settings.ENVIRONMENT == "production":
       app.add_middleware(HTTPSRedirectMiddleware)
   ```

5. **Rate Limiting**
   ```python
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   
   @router.post("/login")
   @limiter.limit("5/minute")  # 5 attempts per minute
   async def login(...):
       ...
   ```

### Frontend

1. **Token Storage**
   ```typescript
   // For web apps: localStorage (XSS vulnerable but convenient)
   // For SSR: httpOnly cookies (more secure)
   
   // Option 1: localStorage (current implementation)
   localStorage.setItem('access_token', token);
   
   // Option 2: Secure cookie (recommended for production)
   document.cookie = `access_token=${token}; Secure; HttpOnly; SameSite=Strict`;
   ```

2. **CSRF Protection**
   ```typescript
   // Include CSRF token in state parameter
   const state = generateRandomString();
   sessionStorage.setItem('oauth_state', state);
   ```

3. **Input Validation**
   ```typescript
   // Validate email format
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   
   // Validate password strength
   const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
   ```

4. **Secure Communication**
   ```typescript
   // Always use HTTPS in production
   const API_URL = process.env.NODE_ENV === 'production'
     ? 'https://api.yourapp.com'
     : 'http://localhost:8000';
   ```

---

## Troubleshooting

### Common Issues

**1. "Invalid or expired token"**
- Check token expiration
- Verify SECRET_KEY matches between token creation and verification
- Ensure clock sync between client and server

**2. "CORS error"**
- Add frontend URL to ALLOWED_ORIGINS in .env
- Check CORS middleware configuration

**3. "Google OAuth fails"**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check redirect URI matches Google Console settings
- Ensure Google+ API is enabled

**4. "Password hash verification fails"**
- Ensure same bcrypt version on all environments
- Check password_hash column length (VARCHAR 255)

---

## Next Steps

1. ✅ Authentication system is complete
2. Implement role-based access control (RBAC)
3. Add email verification for new users
4. Implement password reset flow
5. Add 2FA (Two-Factor Authentication)
6. Set up token blacklist with Redis
7. Add social login (GitHub, LinkedIn)

For more information, see the main `README.md` and `COMMANDS.md`.
