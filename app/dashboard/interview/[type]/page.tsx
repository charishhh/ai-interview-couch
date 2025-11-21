"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, SkipForward, Volume2, Loader2, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Question {
  id: number;
  text: string;
  type: string;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const type = params.type as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [answers, setAnswers] = useState<{ questionId: number; answer: string; analysis?: any }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        // Check if this is a resume-based interview
        const isResumeBased = localStorage.getItem("resumeBasedInterview") === "true";
        const resumeText = localStorage.getItem("userResume");
        const targetRole = localStorage.getItem("targetRole");

        if (isResumeBased && resumeText) {
          // Generate AI questions based on resume
          const response = await fetch("/api/generate-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeText: resumeText,
              targetRole: targetRole || "Software Engineer",
              interviewType: type,
              count: 5,
            }),
          });
          
          const data = await response.json();
          
          // Format the questions
          if (data.questions && Array.isArray(data.questions)) {
            const formattedQuestions = data.questions.map((q: any, idx: number) => ({
              id: idx + 1,
              text: typeof q === "string" ? q : q.text || q.question,
              type: type,
            }));
            setQuestions(formattedQuestions);
          } else {
            // Fallback to default questions
            const fallbackResponse = await fetch(`/api/generate-questions?type=${type}`);
            const fallbackData = await fallbackResponse.json();
            setQuestions(fallbackData.questions || []);
          }
          
          // Clear the flag after loading
          localStorage.removeItem("resumeBasedInterview");
        } else {
          // Use default questions
          const response = await fetch(`/api/generate-questions?type=${type}`);
          const data = await response.json();
          setQuestions(data.questions || []);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        // Fallback to default questions on error
        try {
          const response = await fetch(`/api/generate-questions?type=${type}`);
          const data = await response.json();
          setQuestions(data.questions || []);
        } catch (fallbackError) {
          console.error("Error loading fallback questions:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [type]);

  // Timer
  useEffect(() => {
    if (interviewStarted && !isLoading) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewStarted, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscription((prev) => prev + finalTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startInterview = () => {
    setInterviewStarted(true);
    speakQuestion(questions[0].text);
  };

  const speakQuestion = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Please allow microphone access to continue with the interview.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);
  };

  const analyzeAnswer = async () => {
    if (!transcription.trim()) {
      alert("Please record your answer first!");
      return;
    }

    // Stop recording if still active
    if (isRecording) {
      stopRecording();
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentQuestionIndex].text,
          answer: transcription,
          interviewType: type,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const analysis = await response.json();

      setAnswers((prev) => [
        ...prev,
        {
          questionId: questions[currentQuestionIndex].id,
          answer: transcription,
          analysis: analysis,
        },
      ]);

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTranscription("");
        setAudioUrl(null);
        
        // Speak next question after a short delay
        setTimeout(() => {
          speakQuestion(questions[currentQuestionIndex + 1].text);
        }, 1000);
      } else {
        finishInterview();
      }
    } catch (error) {
      console.error("Error analyzing answer:", error);
      
      // Save answer without analysis and continue
      setAnswers((prev) => [
        ...prev,
        {
          questionId: questions[currentQuestionIndex].id,
          answer: transcription,
          analysis: {
            overallScore: 70,
            strengths: ["Answer recorded"],
            improvements: ["Analysis failed - try again later"],
            fluencyScore: 70,
            confidenceScore: 70,
            contentQuality: 70,
            clarityScore: 70,
            fillerWordCount: 0,
          },
        },
      ]);
      
      alert("Analysis failed, but your answer was saved. Moving to next question.");
      
      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTranscription("");
        setAudioUrl(null);
        setTimeout(() => {
          speakQuestion(questions[currentQuestionIndex + 1].text);
        }, 1000);
      } else {
        finishInterview();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const skipQuestion = () => {
    setAnswers((prev) => [
      ...prev,
      {
        questionId: questions[currentQuestionIndex].id,
        answer: transcription || "[Skipped]",
      },
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTranscription("");
      setAudioUrl(null);
      stopRecording();
      
      setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex + 1].text);
      }, 500);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    // Calculate overall scores
    const totalScore = answers.reduce((sum, ans) => {
      return sum + (ans.analysis?.overallScore || 0);
    }, 0);
    const averageScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;

    // Save interview results
    const interviewId = `interview_${Date.now()}`;
    
    try {
      // Store in localStorage for now (you can add database later)
      const interviewData = {
        id: interviewId,
        userId: user?.id,
        type: type,
        questions: questions,
        answers: answers,
        overallScore: averageScore,
        duration: timer,
        completedAt: new Date().toISOString(),
      };

      const existingInterviews = JSON.parse(localStorage.getItem("interviews") || "[]");
      existingInterviews.push(interviewData);
      localStorage.setItem("interviews", JSON.stringify(existingInterviews));

      // Redirect to results page
      router.push(`/dashboard/results/${interviewId}`);
    } catch (error) {
      console.error("Error saving interview:", error);
      alert("Error saving interview results. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start Your Interview?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Interview Details:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>{questions.length}</strong> questions</li>
                <li>• Type: <strong className="capitalize">{type}</strong></li>
                <li>• Estimated time: <strong>{questions.length * 3}-{questions.length * 5} minutes</strong></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Instructions:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Click the microphone button to start recording your answer</li>
                <li>• Speak clearly and take your time</li>
                <li>• Click "Submit Answer" when you're done with each question</li>
                <li>• You can skip questions if needed</li>
                <li>• AI will analyze your responses in real-time</li>
              </ul>
            </div>

            <Button onClick={startInterview} className="w-full" size="lg">
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold capitalize">{type} Interview</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatTime(timer)}</div>
            <p className="text-sm text-muted-foreground">Elapsed time</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{currentQuestion?.text}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakQuestion(currentQuestion?.text || "")}
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Recording Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Microphone Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-primary hover:bg-primary/90"
              } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <MicOff className="w-16 h-16 text-white" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </button>

            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>

            {/* Transcription Display */}
            {transcription && (
              <div className="w-full p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-2">Your Response:</p>
                <p className="text-sm">{transcription}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={skipQuestion}
                disabled={isAnalyzing}
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Question
              </Button>
              <Button
                onClick={analyzeAnswer}
                disabled={isAnalyzing || !transcription.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Interview Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Take a moment to think before answering</li>
            <li>• Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
            <li>• Speak clearly and maintain a steady pace</li>
            <li>• Provide specific examples from your experience</li>
            <li>• Stay calm and confident - you can always retry!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
