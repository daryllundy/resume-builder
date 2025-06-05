import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, BarChart3, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ResumeScores {
  impactScore: number;
  atsScore: number;
  jobMatchScore: number;
  impactFeedback: string;
  atsFeedback: string;
  jobMatchFeedback: string;
  overallFeedback: string;
  improvements: string[];
}

interface ResumeScoreCardProps {
  resumeContent: string;
  jobDescription?: string;
  showJobMatch?: boolean;
}

export default function ResumeScoreCard({ 
  resumeContent, 
  jobDescription, 
  showJobMatch = false 
}: ResumeScoreCardProps) {
  const [scores, setScores] = useState<ResumeScores | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const analyzeResume = useMutation({
    mutationFn: async () => {
      if (showJobMatch && jobDescription) {
        return apiRequest("/api/analyze-resume", "POST", {
          resumeContent,
          jobDescription
        });
      } else {
        return apiRequest("/api/resume-impact-score", "POST", {
          resumeContent
        });
      }
    },
    onSuccess: (data) => {
      if (showJobMatch) {
        setScores(data);
      } else {
        // For impact-only analysis, create a partial scores object
        setScores({
          impactScore: data.score,
          atsScore: 0,
          jobMatchScore: 0,
          impactFeedback: data.feedback,
          atsFeedback: "",
          jobMatchFeedback: "",
          overallFeedback: data.feedback,
          improvements: data.improvements || []
        });
      }
      toast({
        title: "Analysis complete",
        description: "Your resume has been analyzed successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive"
      });
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const ScoreDisplay = ({ 
    title, 
    score, 
    icon: Icon, 
    feedback 
  }: { 
    title: string; 
    score: number; 
    icon: any; 
    feedback: string; 
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <span className="font-medium">{title}</span>
        </div>
        <div className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score}/100
        </div>
      </div>
      <div className="space-y-2">
        <Progress value={score} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className={getScoreColor(score)}>{getScoreLabel(score)}</span>
          <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
            {score >= 80 ? "Strong" : score >= 60 ? "Moderate" : "Weak"}
          </Badge>
        </div>
      </div>
      {feedback && (
        <p className="text-sm text-gray-600 leading-relaxed">{feedback}</p>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resume Analysis
            </CardTitle>
            <CardDescription>
              {showJobMatch 
                ? "AI-powered analysis of your resume against the job requirements"
                : "AI-powered analysis of your resume's impact and effectiveness"
              }
            </CardDescription>
          </div>
          <Button 
            onClick={() => analyzeResume.mutate()}
            disabled={analyzeResume.isPending}
            className="shrink-0"
          >
            {analyzeResume.isPending ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {scores && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-6">
              {/* Impact Score - Always shown */}
              <ScoreDisplay
                title="Impact Score"
                score={scores.impactScore}
                icon={Zap}
                feedback={scores.impactFeedback}
              />

              {/* ATS and Job Match Scores - Only shown for full analysis */}
              {showJobMatch && scores.atsScore > 0 && (
                <>
                  <Separator />
                  <ScoreDisplay
                    title="ATS Compatibility"
                    score={scores.atsScore}
                    icon={CheckCircle}
                    feedback={scores.atsFeedback}
                  />
                </>
              )}

              {showJobMatch && scores.jobMatchScore > 0 && (
                <>
                  <Separator />
                  <ScoreDisplay
                    title="Job Match"
                    score={scores.jobMatchScore}
                    icon={Target}
                    feedback={scores.jobMatchFeedback}
                  />
                </>
              )}

              {/* Overall Feedback and Improvements */}
              {(scores.overallFeedback || scores.improvements.length > 0) && (
                <>
                  <Separator />
                  <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          <span className="font-medium">Detailed Feedback & Recommendations</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-4 mt-4">
                      {scores.overallFeedback && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Overall Assessment</h4>
                          <p className="text-blue-800 text-sm leading-relaxed">
                            {scores.overallFeedback}
                          </p>
                        </div>
                      )}
                      
                      {scores.improvements.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Recommended Improvements
                          </h4>
                          <div className="space-y-2">
                            {scores.improvements.map((improvement, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
                              >
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                                <p className="text-sm text-orange-800 leading-relaxed">
                                  {improvement}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}