"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, MessageSquare, Briefcase, Phone, Edit, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

const interviewTypes = [
  {
    id: "technical",
    title: "Technical Interview",
    description: "Focuses on problem-solving, data structures, and algorithms.",
    icon: Code,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "behavioral",
    title: "Behavioral Interview",
    description: "Assesses your soft skills, teamwork, and past experiences.",
    icon: MessageSquare,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "hr",
    title: "HR Round",
    description: "Covers company culture, fit, salary expectations, and your resume.",
    icon: Briefcase,
    color: "from-green-500 to-green-600",
  },
  {
    id: "communication",
    title: "Communication",
    description: "Evaluates your verbal clarity, articulation, and presentation skills.",
    icon: Phone,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "custom",
    title: "Custom Questions",
    description: "Create your own interview by adding custom questions.",
    icon: Edit,
    color: "from-pink-500 to-pink-600",
  },
];

export default function InterviewPage() {
  const [showResumeInput, setShowResumeInput] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
  useEffect(() => {
    // Load saved resume from localStorage
    const savedResume = localStorage.getItem("userResume");
    if (savedResume) {
      setResumeText(savedResume);
    }
  }, []);

  const handleStartWithResume = (typeId: string) => {
    setSelectedType(typeId);
    setShowResumeInput(true);
  };

  const saveResumeAndStart = () => {
    if (resumeText.trim()) {
      localStorage.setItem("userResume", resumeText);
      localStorage.setItem("resumeBasedInterview", "true");
      localStorage.setItem("targetRole", targetRole);
    }
    window.location.href = `/dashboard/interview/${selectedType}`;
  };

  if (showResumeInput) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setShowResumeInput(false)}
            className="mb-4"
          >
            ← Back to Interview Types
          </Button>
          <h1 className="text-3xl font-bold">Resume-Based Interview</h1>
          <p className="text-muted-foreground">
            AI will generate personalized questions based on your resume and target role
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Customize Your Interview
            </CardTitle>
            <CardDescription>
              Add your resume and target role for AI-generated questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Role (Optional)</Label>
              <Input
                id="targetRole"
                placeholder="e.g., Senior Software Engineer, Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Specify the position you're preparing for
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Your Resume (Optional)</Label>
              <Textarea
                id="resume"
                placeholder="Paste your resume here or key highlights from your experience..."
                value={resumeText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumeText(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                AI will analyze your experience and generate tailored questions
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={saveResumeAndStart}
                className="flex-1"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Questions & Start
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("resumeBasedInterview");
                  window.location.href = `/dashboard/interview/${selectedType}`;
                }}
                size="lg"
              >
                Skip & Use Default Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Choose Your Practice Session</h1>
        <p className="text-muted-foreground">
          Select a practice session to get started with your AI-powered mock interview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {interviewTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <type.icon className="w-7 h-7 text-white" />
              </div>
              <CardTitle>{type.title}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => handleStartWithResume(type.id)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start with Resume
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <Link href={`/dashboard/interview/${type.id}`}>
                  Quick Start
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
