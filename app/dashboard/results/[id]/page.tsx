"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, CheckCircle2, AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  
  const [interviewData, setInterviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load interview data from localStorage
    const interviews = JSON.parse(localStorage.getItem("interviews") || "[]");
    const interview = interviews.find((i: any) => i.id === interviewId);
    
    if (interview) {
      setInterviewData(interview);
    } else {
      // Redirect if interview not found
      router.push("/dashboard/history");
    }
    
    setIsLoading(false);
  }, [interviewId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Interview not found.</p>
        <Button asChild>
          <Link href="/dashboard/history">Go to History</Link>
        </Button>
      </div>
    );
  }

  // Calculate average scores from answers
  const scores = interviewData.answers
    .filter((a: any) => a.analysis)
    .map((a: any) => a.analysis);
  
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((sum: number, s: any) => sum + (s.overallScore || 0), 0) / scores.length)
    : interviewData.overallScore || 0;

  // Prepare emotion timeline data
  const emotionTimeline = interviewData.emotionAnalysis?.emotionTimeline || [];
  const hasEmotionData = emotionTimeline.length > 0;
  
  const emotionChartData = hasEmotionData ? {
    labels: emotionTimeline.map((e: any, i: number) => `${Math.floor(e.timestamp / 60)}:${(e.timestamp % 60).toString().padStart(2, '0')}`),
    datasets: [
      {
        label: "Sentiment Score",
        data: emotionTimeline.map((e: any) => e.sentiment * 100),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "Confidence",
        data: emotionTimeline.map((e: any) => e.confidence * 100),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  } : {
    labels: ["Start", "1 min", "2 min", "3 min", "End"],
    datasets: [
      {
        label: "Happy",
        data: [60, 65, 70, 75, 80],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
      },
      {
        label: "Neutral",
        data: [30, 25, 20, 18, 15],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      {
        label: "Nervous",
        data: [10, 10, 10, 7, 5],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
      },
    ],
  };

  const sentimentData = {
    labels: ["Fluency", "Confidence", "Clarity", "Content", "Articulation"],
    datasets: [
      {
        label: "Your Performance",
        data: [92, 85, 88, 90, 87],
        backgroundColor: "rgba(78, 95, 248, 0.2)",
        borderColor: "rgb(78, 95, 248)",
        pointBackgroundColor: "rgb(78, 95, 248)",
      },
    ],
  };

  const questionScores = [
    { question: "Q1", score: 85 },
    { question: "Q2", score: 90 },
    { question: "Q3", score: 92 },
    { question: "Q4", score: 78 },
    { question: "Q5", score: 88 },
  ];

  const improvements = [
    'Try to use the STAR method (Situation, Task, Action, Result) to structure your answers more clearly.',
    'Practice speaking at a steady pace to improve fluency and reduce the use of filler words like "um" and "uh".',
    'Maintain a confident posture and make eye contact, even in a virtual interview setting.',
    'Add metrics to project outcomes: Instead of "I led a team," say "I led a 5-person team to deliver results 20% faster."',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Interview Results</h1>
        <p className="text-muted-foreground">Here's a breakdown of your performance. Great job!</p>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - 0.85)}`}
                  className="text-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">85%</div>
                <div className="text-sm text-muted-foreground">Excellent</div>
              </div>
            </div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">
            Based on your performance across all metrics.
          </p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Speech Fluency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">92%</div>
                <p className="text-sm text-muted-foreground">Excellent flow</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confidence Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">Strong presence</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">90%</div>
                <p className="text-sm text-muted-foreground">Well structured</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clarity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">88%</div>
                <p className="text-sm text-muted-foreground">Clear communication</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filler Word Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Could be better</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Articulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">87%</div>
                <p className="text-sm text-muted-foreground">Good delivery</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emotion Timeline</CardTitle>
            <CardDescription>Your emotional state during the interview</CardDescription>
          </CardHeader>
          <CardContent>
            {hasEmotionData ? (
              <>
                <Line
                  data={emotionChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                      title: {
                        display: true,
                        text: 'Real-time Emotion Detection Results'
                      }
                    },
                    scales: {
                      y: {
                        min: -100,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Score (%)'
                        }
                      }
                    }
                  }}
                />
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Emotion Summary:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dominant Emotion:</span>
                      <span className="ml-2 capitalize font-medium">{interviewData.emotionAnalysis?.dominantEmotion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Sentiment:</span>
                      <span className="ml-2 font-medium">{((interviewData.emotionAnalysis?.averageSentiment || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No emotion data available for this interview.</p>
                <p className="text-sm mt-2">Enable camera during interview for emotion analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Performance across different dimensions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-md">
              <Radar
                data={sentimentData}
                options={{
                  responsive: true,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answer Quality */}
      <Card>
        <CardHeader>
          <CardTitle>Answer Quality per Question</CardTitle>
          <CardDescription>Breakdown of your performance on each question</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionScores.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.question}</span>
                  <span className="text-muted-foreground">{item.score}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.score >= 85
                        ? "bg-green-500"
                        : item.score >= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>AI Suggestions for Improvement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {improvements.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download PDF Report
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard/interview">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Link>
        </Button>
      </div>
    </div>
  );
}
