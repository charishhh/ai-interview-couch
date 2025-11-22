"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, MessageSquare, Briefcase, Phone, Edit, FileText, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Load saved resume from localStorage
    const savedResume = localStorage.getItem("userResume");
    if (savedResume) {
      setResumeText(savedResume);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setIsProcessing(true);
        
        // Extract text from file
        const text = await extractTextFromFile(file);
        setResumeText(text);
        setIsProcessing(false);
      }
    },
  });

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.readAsText(file);
    });
  };

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
    const selectedTypeInfo = interviewTypes.find(t => t.id === selectedType);
    
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
          <div className="flex items-center gap-3 mb-2">
            {selectedTypeInfo && (
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTypeInfo.color} flex items-center justify-center`}>
                <selectedTypeInfo.icon className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="text-3xl font-bold">Upload Your Resume</h1>
          </div>
          <p className="text-muted-foreground">
            AI will generate personalized {selectedTypeInfo?.title || 'interview'} questions based on your resume and experience
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
              <Label htmlFor="resume">Your Resume</Label>
              
              {/* File Upload Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 dark:border-gray-700 hover:border-primary"
                }`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center space-y-3">
                    <FileText className="w-12 h-12 text-primary" />
                    <div>
                      <p className="font-semibold">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setResumeText("");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">
                        {isDragActive ? "Drop your file here" : "Upload Resume or Drag & Drop"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOCX, or TXT (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Or text input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              <Textarea
                id="resume"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumeText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                disabled={isProcessing}
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
                disabled={!resumeText.trim() && !uploadedFile}
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
            
            {!resumeText.trim() && !uploadedFile && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                Please upload a resume or paste your resume text to generate AI questions
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Choose Your Practice Session</h1>
          <p className="text-muted-foreground">
            Select a practice session to get started with your AI-powered mock interview.
          </p>
        </div>
        <Button 
          size="lg"
          onClick={() => {
            setSelectedType("technical"); // Default to technical
            setShowResumeInput(true);
          }}
          className="hidden md:flex"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Resume
        </Button>
      </div>

      {/* Mobile Upload Button */}
      <Button 
        size="lg"
        onClick={() => {
          setSelectedType("technical");
          setShowResumeInput(true);
        }}
        className="w-full md:hidden"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Resume for AI Questions
      </Button>

      {/* Call-to-action card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Get Personalized Questions</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Upload your resume and our AI will generate custom interview questions based on your experience, skills, and target role.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedType("technical");
                  setShowResumeInput(true);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload & Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
