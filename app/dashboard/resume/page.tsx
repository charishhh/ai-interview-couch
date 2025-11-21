"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle2, AlertTriangle, Lightbulb, Target, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setAnalyzed(false);
      }
    },
  });

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Upload your resume to get instant AI-powered feedback and generate tailored interview questions.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
          <CardDescription>
            Drag & drop your resume or click to upload (PDF, DOCX, up to 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 dark:border-gray-700 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              {file ? (
                <>
                  <FileText className="w-16 h-16 text-primary" />
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change File
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">
                      {isDragActive ? "Drop your file here" : "Drag & Drop Your Resume"}
                    </p>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Target Job Role (e.g., Frontend Developer)
            </label>
            <Input
              placeholder="Enter the job title you're applying for"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleAnalyze}
            disabled={!file || !jobRole || analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analyzed && (
        <div className="space-y-6">
          {/* Strengths */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle>Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-sm">
                    AI highlights positive aspects like strong action verbs that demonstrate leadership and technical expertise.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-sm">
                    Well-organized sections and clear bullet points make your resume easy to scan.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-sm">
                    Includes relevant technical skills aligned with industry standards.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle>Weaknesses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠</span>
                  <span className="text-sm">
                    Identifies potential issues like positive language, vague descriptions, lack of targeted metrics, or formatting inconsistencies.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠</span>
                  <span className="text-sm">
                    Missing quantifiable achievements - add numbers to show impact (e.g., "Increased efficiency by 30%").
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠</span>
                  <span className="text-sm">
                    Some sections could benefit from more specific examples of your contributions.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Suggested Improvements */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>Suggested Improvements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">💡</span>
                  <span className="text-sm">
                    Provides specific, actionable recommendations, such as "Instead of 'Worked on a project,' try 'Led a team of 5 developers to deliver 20% faster.'"
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">💡</span>
                  <span className="text-sm">
                    Add metrics to project outcomes - numbers and percentages make your impact more tangible.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">💡</span>
                  <span className="text-sm">
                    Tailor your skills section to match keywords from the {jobRole} job description.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">💡</span>
                  <span className="text-sm">
                    Consider adding a brief professional summary at the top highlighting your unique value proposition.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Job Role Matching */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <CardTitle>Job Role Matching</CardTitle>
              </div>
              <CardDescription>
                Analyzes resume keywords against the target job role: {jobRole}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className="text-sm font-bold">78%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[78%]" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  To identify alignment and suggest relevant tweaks or experience to make an ATS-compatible resume. Your resume shows good alignment with the role requirements. Consider adding more specific technologies and frameworks commonly used in {jobRole} positions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle>Ready for the Next Step?</CardTitle>
              <CardDescription>
                Use your analyzed resume to generate a personalized mock interview based on your experience and target role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" asChild>
                <a href="/dashboard/interview">Generate Tailored Interview</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
