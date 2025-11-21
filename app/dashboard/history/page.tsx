"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load interviews from localStorage
    const interviews = JSON.parse(localStorage.getItem("interviews") || "[]");
    
    // Sort by date (newest first)
    const sortedInterviews = interviews.sort((a: any, b: any) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    
    setInterviewHistory(sortedInterviews);
    setIsLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getTrend = (score: number, index: number) => {
    if (index >= interviewHistory.length - 1) return "neutral";
    const prevScore = interviewHistory[index + 1].overallScore;
    return score > prevScore ? "up" : score < prevScore ? "down" : "neutral";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Interview History</h1>
        <p className="text-muted-foreground">Review all your past interview sessions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewHistory.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviewHistory.length > 0
                ? Math.round(
                    interviewHistory.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
                      interviewHistory.length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviewHistory.length > 0
                ? `${Math.round(
                    interviewHistory.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60
                  )}h`
                : "0h"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview List */}
      <Card>
        <CardHeader>
          <CardTitle>All Interviews</CardTitle>
          <CardDescription>Click on any interview to view detailed results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviewHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No interviews yet. Start your first interview!</p>
                <Button asChild>
                  <Link href="/dashboard/interview">Start Interview</Link>
                </Button>
              </div>
            ) : (
              interviewHistory.map((interview, index) => {
                const trend = getTrend(interview.overallScore, index);
                return (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {interview.overallScore}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold capitalize">{interview.type} Interview</h3>
                          {trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : trend === "down" ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(interview.completedAt)} at {formatTime(interview.completedAt)} • {formatDuration(interview.duration)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/results/${interview.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
