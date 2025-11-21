# Clerk Authentication Setup Guide

## 🔐 Complete Clerk Authentication Integration

Your Clerk authentication is now fully configured! Here's how to set it up:

## 1️⃣ Get Your Clerk API Keys

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up or log in
3. Create a new application
4. Choose **Email**, **Google**, or any other authentication methods you want
5. Copy your API keys from the **API Keys** section

## 2️⃣ Configure Environment Variables

Update your `.env.local` file with your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

## 3️⃣ Configure Redirect URLs in Clerk Dashboard

In your Clerk Dashboard, go to **Paths** and set:

- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/dashboard`
- **After sign-up URL**: `/dashboard`

## 4️⃣ Test Your Authentication

Start your development server:

```powershell
npm run dev
```

Then test:

1. **Public Pages**: 
   - Visit `http://localhost:3000` (home page - no auth required)

2. **Sign Up**: 
   - Click "Get Started" or visit `http://localhost:3000/sign-up`
   - Create a new account

3. **Sign In**: 
   - Visit `http://localhost:3000/sign-in`
   - Log in with your credentials

4. **Protected Dashboard**: 
   - Visit `http://localhost:3000/dashboard`
   - You'll be redirected to sign-in if not authenticated

5. **User Profile**: 
   - Once signed in, click your avatar in the navbar
   - Access profile settings and sign out

## 📁 What Was Created

### Authentication Pages
- ✅ `/app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- ✅ `/app/sign-up/[[...sign-up]]/page.tsx` - Sign up page

### Middleware & Protection
- ✅ `/middleware.ts` - Updated to Clerk v5 API
- ✅ `/app/dashboard/layout.tsx` - Server-side auth check

### Components
- ✅ `/components/auth/NavBar.tsx` - Navbar with UserButton
- ✅ `/components/auth/AuthCheck.tsx` - Client-side auth wrapper

### Configuration
- ✅ `.env.local` - Environment variables template

## 🎨 Clerk Features Enabled

### Built-in Features
- ✅ Email/Password authentication
- ✅ Email verification
- ✅ Password reset
- ✅ User profile management
- ✅ Session management
- ✅ Multi-factor authentication (optional)

### Social OAuth (Add in Dashboard)
- 🔐 Google OAuth
- 🔐 GitHub OAuth
- 🔐 Microsoft OAuth
- 🔐 Facebook, Twitter, LinkedIn, etc.

## 🔧 Using Clerk in Your Components

### Client Components

```typescript
"use client";
import { useUser } from "@clerk/nextjs";

export default function MyComponent() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Hello {user.firstName}!</h1>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

### Server Components

```typescript
import { currentUser } from "@clerk/nextjs/server";

export default async function MyPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Hello {user.firstName}!</h1>
      <p>User ID: {user.id}</p>
    </div>
  );
}
```

### API Routes

```typescript
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({ userId: user.id });
}
```

## 🎯 Protected Routes

Routes are protected by the middleware. Public routes:
- `/` (home page)
- `/sign-in/*`
- `/sign-up/*`

All other routes require authentication.

## 🚀 Next Steps

1. **Customize Appearance**: 
   - Go to Clerk Dashboard → Customization
   - Match your brand colors
   - Add your logo

2. **Add Social Providers**:
   - Enable Google, GitHub, etc. in Dashboard
   - Users can sign in with one click

3. **Configure Email Templates**:
   - Customize verification emails
   - Personalize welcome messages

4. **Add Webhooks** (Optional):
   - Sync user data with your database
   - Trigger actions on user events

## 📚 Useful Clerk Hooks

```typescript
import {
  useUser,        // Get current user
  useAuth,        // Get auth state and methods
  useSignIn,      // Control sign-in flow
  useSignUp,      // Control sign-up flow
  useClerk,       // Access Clerk instance
} from "@clerk/nextjs";
```

## 🔒 Security Best Practices

✅ API keys are in `.env.local` (gitignored)  
✅ Middleware protects all routes by default  
✅ Server-side auth checks in layouts  
✅ HTTPS enforced in production  
✅ Session tokens are httpOnly cookies  

## 🐛 Troubleshooting

**Problem**: "Invalid publishable key"
- **Solution**: Check your `.env.local` has correct keys
- Restart dev server after adding keys: `npm run dev`

**Problem**: Redirects not working
- **Solution**: Verify URLs in Clerk Dashboard → Paths

**Problem**: Middleware errors
- **Solution**: Make sure you're using Clerk v5 syntax
- Check `middleware.ts` is using `clerkMiddleware`

**Problem**: User data not showing
- **Solution**: Use `useUser()` in client components
- Use `currentUser()` in server components

## 📖 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js 14 + Clerk Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

**✅ Your authentication is ready to use!**

Start your server and visit `/sign-up` to create your first account.
