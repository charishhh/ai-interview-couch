# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Step 1: Install Dependencies
Open PowerShell in the project directory and run:
```powershell
npm install
```

### Step 2: Set Up Environment Variables
1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. Get your API keys:
   - **Clerk**: Sign up at https://clerk.com and create an app
   - **OpenAI**: Get key from https://platform.openai.com/api-keys
   - **Database**: Use local PostgreSQL or get free hosted DB from https://supabase.com

3. Edit `.env` file with your actual keys

### Step 3: Set Up Database
```powershell
npx prisma generate
npx prisma db push
```

### Step 4: Run the App
```powershell
npm run dev
```

Visit http://localhost:3000 🎉

## 📱 What You'll See

### Landing Page (/)
- Beautiful hero section
- Feature cards
- Testimonials
- Sign up/Login buttons

### After Login (/dashboard)
- Dashboard with stats and charts
- New Interview button
- Resume Analyzer
- History of past interviews

### Interview Flow
1. Choose interview type
2. Record your answers
3. Get instant AI feedback
4. See detailed scores and analytics

## 🎯 Test Features Without Setup

If you want to skip API setup initially:
1. The UI is fully functional
2. Recording interface works (no transcription)
3. Mock data shows how results look
4. Replace mock data with real API later

## 🆘 Need Help?

**Database not connecting?**
- Use this connection string format:
  `postgresql://user:password@localhost:5432/dbname?schema=public`

**Clerk not working?**
- Verify you added both publishable AND secret keys
- Check redirect URLs in Clerk dashboard

**TypeScript errors?**
- Run: `npm install` (this fixes missing type definitions)

## 🎨 Customize

**Change colors:** Edit `app/globals.css`
**Add features:** All pages are in `app/dashboard/`
**Modify UI:** Components are in `components/ui/`

## 📚 Next Steps

1. ✅ Set up Clerk authentication
2. ✅ Connect PostgreSQL database
3. ✅ Add OpenAI API key
4. 🚀 Deploy to Vercel
5. 🎉 Share with friends!

---

**Questions?** Open an issue or read the full README.md
