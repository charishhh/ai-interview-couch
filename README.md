# 🎯 AI Interview Coach

A modern, AI-powered mock interview platform that helps job seekers practice interviews, get real-time feedback, and analyze their performance with detailed metrics and insights.

![AI Interview Coach](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎤 AI-Powered Mock Interviews
- **Multiple Interview Types**: Technical, Behavioral, HR, Communication, and Custom
- **Real-time Voice Recording**: Practice with speech-to-text transcription
- **Live Timer**: Track your response time for each question
- **Progress Tracking**: Visual progress bar showing interview completion

### 📊 Detailed Performance Analytics
- **Overall Scoring**: Comprehensive performance metrics (0-100%)
- **Multi-dimensional Analysis**:
  - Speech Fluency Score
  - Confidence Level
  - Content Quality
  - Clarity & Articulation
  - Filler Word Detection
- **Visual Charts**:
  - Emotion Timeline (Line Chart)
  - Sentiment Distribution (Radar Chart)
  - Question-by-Question Performance (Bar Charts)

### 📄 Resume Analyzer
- **Drag & Drop Upload**: Support for PDF and DOCX formats
- **AI-Powered Analysis**:
  - Identify Strengths
  - Detect Weaknesses
  - Actionable Improvements
  - ATS Match Score
  - Job Role Alignment
- **Personalized Suggestions**: Tailored recommendations based on target job role

### 📈 Dashboard & History
- **Performance Dashboard**: Track progress over time
- **Interview History**: Review all past practice sessions
- **Trend Analysis**: See improvement metrics and patterns
- **Quick Actions**: Jump into new interviews or analyze resumes

### 🎨 Modern UI/UX
- **Clean, Minimal Design**: Inspired by MockMate and modern SaaS platforms
- **Dark Mode Support**: Seamless light/dark theme switching
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Glassmorphism Effects**: Modern card designs with soft shadows

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Chart.js & Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **AI Integration**: OpenAI GPT-4

### Deployment
- **Platform**: Vercel (recommended)
- **Database Hosting**: Supabase, Railway, or Neon

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL database (local or cloud)
- Clerk account for authentication
- OpenAI API key

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ai-interview-coach
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_interview_db?schema=public"

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting API Keys

### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key and secret key
4. Configure sign-in/sign-up settings

### OpenAI (AI Features)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an account and get API key
3. Add billing information (required for API usage)
4. Use GPT-4 model for best results

### PostgreSQL Database
Choose one of these options:
- **Local**: Install PostgreSQL locally
- **Supabase**: [supabase.com](https://supabase.com) - Free tier available
- **Railway**: [railway.app](https://railway.app) - Easy PostgreSQL hosting
- **Neon**: [neon.tech](https://neon.tech) - Serverless PostgreSQL

## 📁 Project Structure

```
ai-interview-coach/
├── app/
│   ├── api/                    # API routes
│   │   ├── analyze-answer/     # Answer analysis endpoint
│   │   ├── analyze-resume/     # Resume analysis endpoint
│   │   └── generate-questions/ # Question generation
│   ├── dashboard/              # Main dashboard pages
│   │   ├── interview/          # Interview sessions
│   │   ├── results/            # Results & feedback
│   │   ├── resume/             # Resume analyzer
│   │   ├── history/            # Interview history
│   │   └── settings/           # User settings
│   ├── sign-in/                # Authentication pages
│   ├── sign-up/
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── lib/
│   └── utils.ts                # Utility functions
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── .env.example                # Environment template
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── package.json
```

## 🎯 Usage Guide

### Starting an Interview
1. Sign up or log in to your account
2. Click "New Interview" from dashboard
3. Choose interview type (Technical, Behavioral, HR, etc.)
4. Click the microphone to start recording
5. Answer each question clearly
6. Review your results with detailed feedback

### Analyzing Your Resume
1. Navigate to "Resume Analyzer"
2. Upload your resume (PDF or DOCX)
3. Enter your target job role
4. Click "Analyze Resume"
5. Review strengths, weaknesses, and suggestions
6. Generate tailored interview questions

### Tracking Progress
1. Visit the Dashboard to see:
   - Total interviews completed
   - Average scores
   - Performance trends
   - Skill-wise breakdown
2. Check "History" for detailed past sessions

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables on Vercel
Add all variables from `.env` to Vercel project settings:
- Clerk keys
- Database URL
- OpenAI API key

## 🎨 Customization

### Colors & Theme
Edit `tailwind.config.ts` and `app/globals.css`:

```css
:root {
  --primary: 245 58% 51%;      /* Blue-purple */
  --secondary: 240 4.8% 95.9%; /* Light gray */
  /* ... */
}
```

### Adding Interview Types
Edit `app/dashboard/interview/page.tsx`:

```typescript
const interviewTypes = [
  {
    id: "custom-type",
    title: "Your Custom Type",
    description: "Description here",
    icon: YourIcon,
    color: "from-color-to-color",
  },
];
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Ensure PostgreSQL is running
- Check firewall settings

### Clerk Authentication Not Working
- Verify all Clerk environment variables
- Check redirect URLs match your app
- Clear browser cache and cookies

### OpenAI API Errors
- Confirm API key is valid
- Check billing/quota limits
- Verify model availability (GPT-4)

## 📝 API Routes

### `POST /api/analyze-answer`
Analyzes interview answer and returns scores.

**Request:**
```json
{
  "question": "Tell me about yourself",
  "answer": "I am a software developer...",
  "interviewType": "behavioral"
}
```

### `POST /api/analyze-resume`
Analyzes resume content.

**Request:**
```json
{
  "resumeText": "John Doe - Software Engineer...",
  "targetRole": "Frontend Developer"
}
```

### `GET /api/generate-questions?type=technical`
Returns interview questions by type.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by MockMate
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- AI powered by [OpenAI](https://openai.com/)

## 📧 Support

For support, email support@example.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js and AI**
