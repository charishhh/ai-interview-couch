# Authentication Module - Quick Reference

## 📚 Complete Files Created

### New Files:
- ✅ `backend/app/routes/auth_complete.py` - Complete auth routes with Google OAuth
- ✅ `backend/app/utils/oauth.py` - Google OAuth utilities
- ✅ `backend/AUTH_GUIDE.md` - Comprehensive authentication documentation

### Updated Files:
- ✅ `backend/app/config.py` - Added Google OAuth settings
- ✅ `backend/app/schemas.py` - Added Token and RefreshTokenRequest schemas
- ✅ `backend/.env.example` - Added Google OAuth environment variables
- ✅ `backend/requirements.txt` - Added httpx for OAuth HTTP requests
- ✅ `backend/app/models.py` - Updated to support OAuth profiles

---

## 🔐 Authentication System Features

### ✅ Implemented:

1. **User Registration** - Email/password with bcrypt hashing
2. **User Login** - Returns JWT access + refresh tokens
3. **Token Refresh** - Extend session without re-login
4. **Protected Routes** - Dependency injection middleware
5. **Google OAuth 2.0** - Social login integration
6. **Token Validation** - JWT verification with expiration
7. **User Profile** - Get current authenticated user
8. **Logout** - Client-side token cleanup

---

## 🚀 Quick Start

### 1. Update Environment Variables

Add to `.env`:
```env
# JWT Settings (REQUIRED)
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
JWT_ALGORITHM=HS256

# Google OAuth (OPTIONAL - for social login)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### 2. Install Dependencies

```powershell
pip install httpx==0.25.2
```

### 3. Use Complete Auth Routes

Replace current `auth.py` with `auth_complete.py`:
```powershell
Move-Item backend\app\routes\auth.py backend\app\routes\auth_old.py
Move-Item backend\app\routes\auth_complete.py backend\app\routes\auth.py
```

### 4. Start Server

```powershell
cd backend
uvicorn app.main:app --reload
```

---

## 📝 cURL Examples

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'
```

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "created_at": "2025-11-21T10:00:00Z"
}
```

---

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJleHAiOjE3MDA1Njg2MDAsImlhdCI6MTcwMDU2NjgwMH0.xyz",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzAxMTcxNjAwLCJpYXQiOjE3MDA1NjY4MDB9.abc",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Save tokens:**
```bash
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Get Current User Profile (Protected)

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "profile_data": null,
  "created_at": "2025-11-21T10:00:00Z",
  "updated_at": "2025-11-21T10:00:00Z"
}
```

---

### Refresh Access Token

```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(new token)",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(same token)",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

### Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response:**
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

---

### Google OAuth - Get Authorization URL

```bash
curl -X GET http://localhost:8000/api/auth/google
```

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8000/api/auth/google/callback&response_type=code&scope=openid+email+profile&access_type=offline&prompt=consent",
  "message": "Redirect user to this URL to authenticate with Google"
}
```

**Usage:**
1. Open the `authorization_url` in a browser
2. User logs in with Google
3. Google redirects to `/api/auth/google/callback?code=...`
4. Callback endpoint returns JWT tokens

---

### Test Protected Interview Endpoint

```bash
curl -X POST http://localhost:8000/api/interviews/start \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Developer Interview",
    "job_position": "Senior Python Developer",
    "difficulty": "hard",
    "total_questions": 10
  }'
```

---

## 🔒 PowerShell Examples (Windows)

### Register + Login + Get Profile

```powershell
# Register
$registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"Test1234!","full_name":"Test User"}'

Write-Host "User registered: $($registerResponse.email)"

# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"Test1234!"}'

$accessToken = $loginResponse.access_token
$refreshToken = $loginResponse.refresh_token
Write-Host "Access Token: $($accessToken.Substring(0, 50))..."

# Get Profile
$profileResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" `
  -Method Get `
  -Headers @{ "Authorization" = "Bearer $accessToken" }

Write-Host "Profile: $($profileResponse.full_name) - $($profileResponse.email)"
```

---

### Refresh Token Flow

```powershell
# Wait for access token to expire (or force it for testing)
Start-Sleep -Seconds 5

# Refresh access token
$refreshResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/refresh" `
  -Method Post `
  -ContentType "application/json" `
  -Body "{`"refresh_token`":`"$refreshToken`"}"

$newAccessToken = $refreshResponse.access_token
Write-Host "New Access Token: $($newAccessToken.Substring(0, 50))..."

# Use new token
$profileResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" `
  -Method Get `
  -Headers @{ "Authorization" = "Bearer $newAccessToken" }

Write-Host "Still authenticated: $($profileResponse.email)"
```

---

## 🌐 Frontend Integration (React/Next.js)

### Store Tokens

```javascript
// After successful login
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

### Make Authenticated Requests

```javascript
const accessToken = localStorage.getItem('access_token');

const response = await fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const user = await response.json();
console.log('Current user:', user);
```

### Auto-Refresh on 401

```javascript
// API client with auto-refresh
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  // If 401, try refreshing token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    const refreshResponse = await fetch('http://localhost:8000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem('access_token', data.access_token);
      
      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${data.access_token}`
        }
      });
    } else {
      // Refresh failed - redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  
  return response;
}
```

### Google OAuth Flow

```javascript
// Initiate Google login
async function loginWithGoogle() {
  const response = await fetch('http://localhost:8000/api/auth/google');
  const data = await response.json();
  
  // Redirect to Google login page
  window.location.href = data.authorization_url;
}

// Handle callback (in /auth/google/callback page)
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    fetch(`http://localhost:8000/api/auth/google/callback?code=${code}`)
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        window.location.href = '/dashboard';
      });
  }
}, []);
```

---

## 🛡️ Security Best Practices

### Backend:

1. **Strong SECRET_KEY**: Use at least 32 characters
   ```python
   import secrets
   secrets.token_urlsafe(32)
   ```

2. **HTTPS Only** (Production):
   ```python
   if settings.ENVIRONMENT == "production":
       app.add_middleware(HTTPSRedirectMiddleware)
   ```

3. **Rate Limiting**:
   ```python
   from slowapi import Limiter
   
   @router.post("/login")
   @limiter.limit("5/minute")  # 5 login attempts per minute
   async def login(...):
       ...
   ```

### Frontend:

1. **Secure Token Storage**:
   - Development: `localStorage` (convenient but XSS vulnerable)
   - Production: `httpOnly` cookies (more secure)

2. **CSRF Protection**:
   - Include state parameter in OAuth flow
   - Validate state on callback

3. **Token Expiration Handling**:
   - Implement auto-refresh on 401 errors
   - Clear tokens on logout
   - Handle refresh failure gracefully

---

## 📖 Documentation

For complete documentation, see:
- **AUTH_GUIDE.md** - Comprehensive authentication guide
- **DATABASE_SETUP.md** - Database and migrations
- **README.md** - General project setup
- **COMMANDS.md** - Quick command reference

---

## 🔧 Troubleshooting

### "Invalid token" errors:
- Check SECRET_KEY is consistent
- Verify token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

### Google OAuth fails:
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check redirect URI matches Google Console
- Ensure Google+ API is enabled

### Password verification fails:
- Confirm bcrypt version is consistent
- Check password_hash column is VARCHAR(255)

---

**✅ Authentication Module Complete!**

Your backend now has enterprise-grade authentication with:
- Email/password registration
- JWT token-based auth
- Token refresh mechanism
- Protected route middleware
- Google OAuth 2.0 integration
- Complete frontend integration examples
