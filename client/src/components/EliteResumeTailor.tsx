import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  FileText,
  BarChart3,
  Download,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EliteTailoringResult {
  jobAnalysis: {
    keywords: string[];
    competencies: string[];
    cultureCues: string[];
  };
  resumeAnalysis: {
    keywordMap: Array<{ keyword: string; status: 'Present' | 'Partial' | 'Missing' }>;
    redFlags: string[];
  };
  tailoredResume: string;
  atsChecklist: Array<{ item: string; status: 'Pass' | 'Fix' }>;
  scores: {
    atsScore: number;
    keywordScore: number;
    recruiterScore: number;
  };
  improvementTips: string[];
}

interface EliteResumeTailorProps {
  resumeContent: string;
  jobDescription: string;
  onOptimizedResume?: (resume: string) => void;
}

export default function EliteResumeTailor({ 
  resumeContent, 
  jobDescription, 
  onOptimizedResume 
}: EliteResumeTailorProps) {
  const [result, setResult] = useState<EliteTailoringResult | null>(null);
  const { toast } = useToast();

  const eliteTailorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/elite-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeContent,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error("Failed to perform elite tailoring");
      }

      return response.json();
    },
    onSuccess: (data: EliteTailoringResult) => {
      setResult(data);
      onOptimizedResume?.(data.tailoredResume);
      toast({
        title: "Elite Optimization Complete",
        description: "Your resume has been professionally optimized for maximum impact.",
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize resume",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Elite Resume Optimization
          </CardTitle>
          <p className="text-sm text-gray-600">
            Advanced AI-powered resume analysis and optimization for maximum ATS compatibility and recruiter appeal.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => eliteTailorMutation.mutate()}
            disabled={eliteTailorMutation.isPending || !resumeContent || !jobDescription}
            className="w-full"
            size="lg"
          >
            {eliteTailorMutation.isPending ? (
              <>Analyzing & Optimizing...</>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Perform Elite Optimization
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="scores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="resume">Optimized Resume</TabsTrigger>
            <TabsTrigger value="checklist">ATS Check</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">ATS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    <span className={getScoreColor(result.scores.atsScore)}>
                      {result.scores.atsScore}%
                    </span>
                  </div>
                  <Progress value={result.scores.atsScore} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Keyword Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    <span className={getScoreColor(result.scores.keywordScore)}>
                      {result.scores.keywordScore}%
                    </span>
                  </div>
                  <Progress value={result.scores.keywordScore} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recruiter Appeal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    <span className={getScoreColor(result.scores.recruiterScore)}>
                      {result.scores.recruiterScore}%
                    </span>
                  </div>
                  <Progress value={result.scores.recruiterScore} className="h-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {result.scores.atsScore >= 90 && result.scores.keywordScore >= 90 && result.scores.recruiterScore >= 90 ? (
                    <>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium text-green-600">Elite Level - Ready for Top Opportunities</span>
                    </>
                  ) : result.scores.atsScore >= 75 && result.scores.keywordScore >= 75 && result.scores.recruiterScore >= 75 ? (
                    <>
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-blue-600">Professional Level - Strong Candidate Profile</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-orange-600">Needs Improvement - Follow Optimization Tips</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Job Requirements Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Skills & Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.jobAnalysis.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Core Competencies</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.jobAnalysis.competencies.map((comp, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Culture & Values</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.jobAnalysis.cultureCues.map((cue, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-purple-50">
                          {cue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resume Keyword Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.resumeAnalysis.keywordMap.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm">{item.keyword}</span>
                        <Badge
                          variant={
                            item.status === 'Present' ? 'default' :
                            item.status === 'Partial' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {item.status === 'Present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {item.status === 'Partial' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.status === 'Missing' && <XCircle className="h-3 w-3 mr-1" />}
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.resumeAnalysis.redFlags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.resumeAnalysis.redFlags.map((flag, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Optimized Resume
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.tailoredResume)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsText(result.tailoredResume, "optimized-resume.txt")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                    {result.tailoredResume}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ATS & Recruiter Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.atsChecklist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{item.item}</span>
                      <Badge variant={item.status === 'Pass' ? 'default' : 'destructive'}>
                        {item.status === 'Pass' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.improvementTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}