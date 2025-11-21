# 🎯 Commands to Run - Copy & Paste

## Step 1: Navigate to Project
```powershell
cd "c:\Users\chari\OneDrive\Pictures\Desktop\ai resume builder"
```

## Step 2: Install All Dependencies
```powershell
npm install
```
This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Clerk (authentication)
- Prisma (database)
- OpenAI SDK
- Chart.js & Recharts
- shadcn/ui components
- And all other dependencies

## Step 3: Set Up Environment Variables
```powershell
# Copy the example file
Copy-Item .env.example .env

# Then edit .env with your API keys
notepad .env
```

### Required API Keys:

**1. Clerk (Free):**
- Go to: https://clerk.com
- Create account → New application
- Copy: Publishable Key & Secret Key
- Paste into `.env` file

**2. OpenAI (Paid - $10-50/month):**
- Go to: https://platform.openai.com/api-keys
- Create account → Add billing method
- Create new secret key
- Paste into `.env` file as `OPENAI_API_KEY`

**3. PostgreSQL Database (Free option):**
- **Option A - Supabase (Recommended):**
  - Go to: https://supabase.com
  - Create project → Get connection string
  - Use "Connection Pooling" string
  
- **Option B - Local PostgreSQL:**
  - Install PostgreSQL on your computer
  - Create database: `ai_interview_db`
  - Connection string: `postgresql://postgres:password@localhost:5432/ai_interview_db`

## Step 4: Initialize Database
```powershell
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push
```

## Step 5: Run Development Server
```powershell
npm run dev
```

Then open: **http://localhost:3000**

## 🎉 You should see:
- Landing page with "AI Interview Coach"
- Sign Up and Login buttons
- Features section
- Testimonials

## 🔐 Test the App:
1. Click "Sign Up"
2. Create account (or use Google)
3. You'll be redirected to Dashboard
4. Try "New Interview" or "Resume Analyzer"

## 🚨 Common Issues & Fixes

### Issue: `npm install` fails
**Fix:**
```powershell
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

### Issue: Database connection error
**Fix:**
- Check your `DATABASE_URL` in `.env`
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- Test connection: `npx prisma db push`

### Issue: Clerk authentication not working
**Fix:**
- Verify you added BOTH keys in `.env`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: TypeScript errors
**Fix:**
```powershell
# Rebuild TypeScript
npm run build
```

### Issue: Port 3000 already in use
**Fix:**
```powershell
# Find and kill process on port 3000
Get-Process -Name node | Stop-Process
# Or use different port
$env:PORT=3001; npm run dev
```

## 📦 Optional: View Database
```powershell
# Open Prisma Studio (database GUI)
npx prisma studio
```
This opens: **http://localhost:5555**

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended - Free)
```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Option 2: Manual Deploy
1. Push code to GitHub
2. Go to: https://vercel.com/new
3. Import repository
4. Add environment variables
5. Deploy!

## 📊 Check Everything Works

Run these tests:
```powershell
# 1. Check if Next.js compiles
npm run build

# 2. Check database connection
npx prisma db push

# 3. Check for TypeScript errors
npx tsc --noEmit
```

## 🎨 Customize Your App

### Change App Name:
Edit these files:
- `app/page.tsx` (line ~18)
- `app/layout.tsx` (line ~9)
- `app/dashboard/layout.tsx` (line ~41)

### Change Colors:
Edit `app/globals.css` (lines 4-40)

### Add Features:
All pages are in: `app/dashboard/[feature]/page.tsx`

## 📚 File Locations Quick Reference

```
📁 Project Root
├── 📄 README.md              ← Full documentation
├── 📄 QUICKSTART.md          ← This file!
├── 📄 SETUP_COMPLETE.md      ← Project summary
├── 📄 .env                   ← Your API keys (create this)
├── 📄 .env.example           ← Template
├── 📄 package.json           ← Dependencies
├── 📁 app/
│   ├── page.tsx              ← Landing page
│   ├── layout.tsx            ← Root layout
│   ├── sign-in/              ← Login page
│   ├── sign-up/              ← Signup page
│   └── dashboard/            ← All dashboard pages
├── 📁 components/ui/         ← Reusable components
├── 📁 prisma/
│   └── schema.prisma         ← Database schema
└── 📁 app/api/               ← Backend API routes
```

## ✅ Final Checklist

Before launching:
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all keys
- [ ] Database connected (`npx prisma db push`)
- [ ] App runs locally (`npm run dev`)
- [ ] Sign up/login works
- [ ] Can create an interview
- [ ] Dashboard shows correctly
- [ ] No console errors in browser

## 🎉 Success!

If you can see the landing page at http://localhost:3000, you're done!

**Next steps:**
1. Customize the design
2. Add your own branding
3. Test all features
4. Deploy to Vercel
5. Share with users!

---

**Questions?** Check:
- README.md (detailed guide)
- PROJECT_OVERVIEW.md (architecture)
- Open an issue on GitHub

**Happy building! 🚀**
