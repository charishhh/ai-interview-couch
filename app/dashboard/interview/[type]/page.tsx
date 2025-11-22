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
  
  // Emotion detection states
  const [emotionData, setEmotionData] = useState<any[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [videoEnabled, setVideoEnabled] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Initialize video for emotion detection
  useEffect(() => {
    return () => {
      // Cleanup video stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
    };
  }, []);

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

  const startVideoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setVideoEnabled(true);
        
        // Start emotion detection every 2 seconds
        emotionIntervalRef.current = setInterval(() => {
          captureAndAnalyzeEmotion();
        }, 2000);
      }
    } catch (error) {
      console.error("Error starting video capture:", error);
      // Video is optional, continue without it
      setVideoEnabled(false);
    }
  };

  const stopVideoCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setVideoEnabled(false);
    }
    
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = null;
    }
  };

  const captureAndAnalyzeEmotion = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      // Send to emotion detection API
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          timestamp: timer
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.faces.length > 0) {
          const face = result.faces[0];
          setCurrentEmotion(face.emotion);
          
          // Store emotion data for timeline
          setEmotionData(prev => [...prev, {
            timestamp: timer,
            emotion: face.emotion,
            confidence: face.confidence,
            sentiment: getSentimentScore(face.emotion)
          }]);
        }
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      // Continue interview even if emotion detection fails
    }
  };

  const getSentimentScore = (emotion: string): number => {
    const sentimentMap: { [key: string]: number } = {
      'happy': 1.0,
      'surprise': 0.5,
      'neutral': 0.0,
      'fear': -0.3,
      'sad': -0.6,
      'angry': -0.8,
      'disgust': -0.9
    };
    return sentimentMap[emotion] || 0.0;
  };

  const getDominantEmotion = (): string => {
    if (emotionData.length === 0) return 'neutral';
    
    const emotionCounts: { [key: string]: number } = {};
    emotionData.forEach(data => {
      emotionCounts[data.emotion] = (emotionCounts[data.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
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
      
      // Start video capture for emotion detection
      startVideoCapture();

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

    // Stop video capture
    stopVideoCapture();

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
    // Stop video capture if still running
    stopVideoCapture();
    
    // Calculate overall scores
    const totalScore = answers.reduce((sum, ans) => {
      return sum + (ans.analysis?.overallScore || 0);
    }, 0);
    const averageScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;

    // Calculate emotion summary
    const emotionSummary = emotionData.length > 0 ? {
      dominantEmotion: getDominantEmotion(),
      averageSentiment: emotionData.reduce((sum, e) => sum + e.sentiment, 0) / emotionData.length,
      emotionTimeline: emotionData,
    } : null;

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
        emotionAnalysis: emotionSummary,
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

      {/* Recording Controls with Video */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Video Feed and Emotion */}
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Emotion Indicator Overlay */}
                {videoEnabled && isRecording && (
                  <>
                    {/* Top-right: Emotion Badge */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${
                          currentEmotion === 'happy' ? 'bg-green-500' :
                          currentEmotion === 'neutral' ? 'bg-blue-500' :
                          currentEmotion === 'sad' ? 'bg-indigo-500' :
                          currentEmotion === 'angry' ? 'bg-red-500' :
                          currentEmotion === 'surprise' ? 'bg-yellow-500' :
                          currentEmotion === 'fear' ? 'bg-purple-500' :
                          currentEmotion === 'disgust' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`} />
                        <div>
                          <div className="text-xs opacity-75">Emotion</div>
                          <div className="font-semibold capitalize text-sm">
                            {currentEmotion === 'happy' ? '😊 Happy' :
                             currentEmotion === 'neutral' ? '😐 Neutral' :
                             currentEmotion === 'sad' ? '😢 Sad' :
                             currentEmotion === 'angry' ? '😠 Angry' :
                             currentEmotion === 'surprise' ? '😲 Surprise' :
                             currentEmotion === 'fear' ? '😨 Fear' :
                             currentEmotion === 'disgust' ? '🤢 Disgust' :
                             '🎭 Detecting...'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom-left: Recording Indicator */}
                    <div className="absolute bottom-4 left-4 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>Recording</span>
                    </div>

                    {/* Bottom-right: Analysis Active */}
                    <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-lg">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>AI Analyzing</span>
                    </div>
                  </>
                )}

                {videoEnabled && !isRecording && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
                    📹 Camera Ready
                  </div>
                )}
                
                {!videoEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 p-6 text-center">
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-sm mb-2">Camera not available</p>
                    <p className="text-xs opacity-75">Emotion detection will be disabled for this session</p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Emotion Stats Mini Panel */}
              {videoEnabled && emotionData.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Emotions Captured:</span>
                    <span className="font-semibold">{emotionData.length} frames</span>
                  </div>
                  {emotionData.length >= 3 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Avg Sentiment:</span>
                        <span className={`font-semibold ${
                          (emotionData.reduce((sum, e) => sum + e.sentiment, 0) / emotionData.length) > 0.3 
                            ? 'text-green-600' 
                            : (emotionData.reduce((sum, e) => sum + e.sentiment, 0) / emotionData.length) < -0.3
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {((emotionData.reduce((sum, e) => sum + e.sentiment, 0) / emotionData.length) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Microphone and Controls */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Emotion Timeline Preview */}
              {emotionData.length > 0 && (
                <div className="w-full max-w-xs p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Emotion Timeline</div>
                  <div className="flex items-end justify-between h-16 gap-1">
                    {emotionData.slice(-10).map((data, idx) => {
                      const height = Math.abs(data.sentiment * 100);
                      const isPositive = data.sentiment > 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1">
                          <div 
                            className={`w-full rounded-t transition-all ${
                              isPositive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ height: `${height}%` }}
                            title={`${data.emotion} (${(data.confidence * 100).toFixed(0)}%)`}
                          />
                          <div className="text-[10px] opacity-50">
                            {idx === emotionData.slice(-10).length - 1 ? 'now' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>😢 Negative</span>
                    <span>😊 Positive</span>
                  </div>
                </div>
              )}

              {/* Microphone Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${
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

              <p className="text-sm text-muted-foreground text-center">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>

              {/* Recording Tips */}
              {!isRecording && (
                <div className="w-full max-w-xs p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">💡 Tips</div>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Maintain good lighting</li>
                    <li>• Look at the camera</li>
                    <li>• Speak clearly and confidently</li>
                  </ul>
                </div>
              )}

              {/* Real-time Stats During Recording */}
              {isRecording && emotionData.length > 0 && (
                <div className="w-full max-w-xs p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-xs font-semibold text-primary mb-2">📊 Live Stats</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Mood:</span>
                      <span className={`font-semibold capitalize ${
                        currentEmotion === 'happy' ? 'text-green-600' :
                        currentEmotion === 'sad' || currentEmotion === 'angry' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {currentEmotion}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-semibold">
                        {emotionData.length > 0 ? `${(emotionData[emotionData.length - 1].confidence * 100).toFixed(0)}%` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transcription Display */}
          {transcription && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Your Response:</p>
              <p className="text-sm">{transcription}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
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
