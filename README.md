# 🎯 AI Interview Coach

AI-powered mock interview platform with real-time feedback and performance analytics.

## Features

- 🎤 Multiple interview types (Technical, Behavioral, HR, Communication)
- 📊 Real-time AI feedback and scoring
- 📄 Resume analyzer with personalized suggestions
- 📈 Performance tracking and history
- 🎨 Dark mode support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: PostgreSQL
- **Auth**: Clerk
- **AI**: OpenAI GPT-4, Google Gemini

## Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/charishhh/ai-interview-couch.git
cd ai-interview-couch
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=your_database_url
```

4. **Run the app**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Add your environment variables in Vercel settings and deploy!

## License

MIT © 2025 AI Interview Coach

---

**Built with ❤️ using Next.js and AI**
