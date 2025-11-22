import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code, MessageSquare, BarChart3, FileText, CheckCircle2, Mic } from "lucide-react"; 
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">AI Interview Coach</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm hover:text-primary">Features</Link>
            <Link href="#testimonials" className="text-sm hover:text-primary">Testimonials</Link>
            <Link href="/sign-in">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Ace Your Next Interview with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant feedback, analyze your performance, and build confidence with your personal AI Interview coach.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">Start Interview</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8">Login</Button>
            </Link>
          </div>

          {/* Hero Illustration */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm text-muted-foreground">Mock Interview</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm">Tell me about a time when you faced a challenging problem...</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-pulse">
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How Our AI Helps You Succeed</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our platform provides you with the tools and insights necessary to excel in any interview situation, tracking your progress along the way.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Scoring</h3>
              <p className="text-muted-foreground">
                Receive objective metrics on your performance.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Feedback</h3>
              <p className="text-muted-foreground">
                Get live suggestions on your pacing, clarity, and filler words.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume Analyzer</h3>
              <p className="text-muted-foreground">
                Learn how to tailor your answers to the job description.
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Use our dashboards to see your improvement over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Trusted by Students Everywhere</h2>
          <p className="text-center text-muted-foreground mb-12">
            Hear from users who have landed their dream jobs with the help of our AI coach.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <div className="font-semibold">surya</div>
                  <div className="text-sm text-muted-foreground">Computer Science Student</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The real-time feedback was a game-changer. I identified and corrected my filler words, which made me sound so much more confident. I landed my internship at Google!"
              </p>
              <div className="flex text-yellow-400">
                {"★★★★★"}
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div>
                  <div className="font-semibold">lohitha</div>
                  <div className="text-sm text-muted-foreground">MBA Attending Graduate</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "I used to get so nervous during interviews. Practicing with the AI helped me structure my answers and stay calm under pressure. Highly recommend it to any grad."
              </p>
              <div className="flex text-yellow-400">
                {"★★★★★"}
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                  ER
                </div>
                <div>
                  <div className="font-semibold">chandu</div>
                  <div className="text-sm text-muted-foreground">UX Design Bootcamp</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The scoring dashboard gave me clear, actionable insights into where I needed to improve. It's like having a personal career coach available 24/7."
              </p>
              <div className="flex text-yellow-400">
                {"★★★★★"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Interview?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of successful candidates who have improved their interview skills with AI.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Mic className="w-5 h-5 text-primary" />
              <span className="font-semibold">© 2025 AI Interview Coach. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary">About</Link>
              <Link href="#" className="hover:text-primary">Contact</Link>
              <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
