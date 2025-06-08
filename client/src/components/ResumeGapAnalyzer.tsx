import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  Clock, 
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Award,
  Zap
} from "lucide-react";

interface SectionGap {
  section: string;
  status: 'missing' | 'weak' | 'adequate' | 'strong';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
  examples: string[];
  impactScore: number;
}

interface ContentGap {
  type: 'keywords' | 'metrics' | 'achievements' | 'skills' | 'formatting';
  section: string;
  description: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

interface GapAnalysisResult {
  overallScore: number;
  completenessScore: number;
  sectionGaps: SectionGap[];
  contentGaps: ContentGap[];
  priorityRecommendations: string[];
  industrySpecificTips: string[];
  atsOptimizationGaps: string[];
  strengthAreas: string[];
  estimatedImprovementTime: string;
}

interface ResumeGapAnalyzerProps {
  resumeContent: string;
  onSectionImprovement?: (section: string, improvedContent: string) => void;
}

export default function ResumeGapAnalyzer({ resumeContent, onSectionImprovement }: ResumeGapAnalyzerProps) {
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionGap | null>(null);
  const [targetIndustry, setTargetIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);

  const gapAnalysisMutation = useMutation({
    mutationFn: async (data: {
      resumeContent: string;
      targetIndustry?: string;
      experienceLevel?: string;
      jobDescription?: string;
    }) => {
      return apiRequest("/api/analyze-gaps", "POST", data);
    },
    onSuccess: (data: GapAnalysisResult) => {
      setAnalysisResult(data);
      setIsAnalyzeDialogOpen(false);
      toast({
        title: "Analysis complete",
        description: `Found ${data.sectionGaps.length + data.contentGaps.length} areas for improvement`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume gaps",
        variant: "destructive",
      });
    }
  });

  const sectionImprovementMutation = useMutation({
    mutationFn: async (data: {
      resumeContent: string;
      sectionName: string;
      currentContent: string;
      recommendations: string[];
    }) => {
      return apiRequest("/api/improve-section", "POST", data);
    },
    onSuccess: (data: { improvedContent: string; explanation: string; keyChanges: string[] }) => {
      if (selectedSection && onSectionImprovement) {
        onSectionImprovement(selectedSection.section, data.improvedContent);
      }
      toast({
        title: "Section improved",
        description: data.explanation,
      });
      setSelectedSection(null);
    },
    onError: (error) => {
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve section",
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = () => {
    gapAnalysisMutation.mutate({
      resumeContent,
      targetIndustry: targetIndustry || undefined,
      experienceLevel: experienceLevel || undefined,
      jobDescription: jobDescription || undefined,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'missing': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'weak': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'adequate': return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'strong': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Resume Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Identify missing sections, content gaps, and improvement opportunities
            </p>
            <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Resume
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Configure Gap Analysis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Industry (Optional)</Label>
                      <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Experience Level (Optional)</Label>
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid-level">Mid Level (3-7 years)</SelectItem>
                          <SelectItem value="senior-level">Senior Level (8-15 years)</SelectItem>
                          <SelectItem value="executive">Executive (15+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Target Job Description (Optional)</Label>
                    <Textarea
                      placeholder="Paste a job description for more targeted analysis..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAnalyzeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAnalyze}
                      disabled={gapAnalysisMutation.isPending}
                    >
                      {gapAnalysisMutation.isPending ? "Analyzing..." : "Start Analysis"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overview Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overall Score</p>
                    <p className="text-2xl font-bold">{analysisResult.overallScore}/100</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={analysisResult.overallScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completeness</p>
                    <p className="text-2xl font-bold">{analysisResult.completenessScore}/100</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={analysisResult.completenessScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Est. Time to Improve</p>
                    <p className="text-2xl font-bold">{analysisResult.estimatedImprovementTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Tabs */}
          <Tabs defaultValue="sections" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sections">Section Gaps</TabsTrigger>
              <TabsTrigger value="content">Content Issues</TabsTrigger>
              <TabsTrigger value="recommendations">Priority Actions</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
            </TabsList>

            {/* Section Gaps */}
            <TabsContent value="sections" className="space-y-4">
              {analysisResult.sectionGaps.map((gap, index) => (
                <Collapsible 
                  key={index}
                  open={expandedSections.includes(`section-${index}`)}
                  onOpenChange={() => toggleSection(`section-${index}`)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(gap.status)}
                            <div>
                              <h3 className="font-semibold">{gap.section}</h3>
                              <p className="text-sm text-gray-600">{gap.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(gap.severity)}>
                              {gap.severity}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              Impact: {gap.impactScore}/10
                            </div>
                            {expandedSections.includes(`section-${index}`) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Recommendations:</h4>
                            <ul className="space-y-1">
                              {gap.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {gap.examples.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Examples:</h4>
                              <ul className="space-y-1">
                                {gap.examples.map((example, i) => (
                                  <li key={i} className="text-sm text-gray-600 italic">
                                    "{example}"
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={() => setSelectedSection(gap)}
                            disabled={sectionImprovementMutation.isPending}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Improve This Section
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </TabsContent>

            {/* Content Gaps */}
            <TabsContent value="content" className="space-y-4">
              {analysisResult.contentGaps.map((gap, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{gap.type}</Badge>
                          <Badge className={getPriorityColor(gap.priority)}>
                            {gap.priority} priority
                          </Badge>
                        </div>
                        <h3 className="font-medium">{gap.section}</h3>
                        <p className="text-sm text-gray-600 mt-1">{gap.description}</p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
                          <ul className="space-y-1">
                            {gap.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                                <span>•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Priority Recommendations */}
            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">High-Impact Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.priorityRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {analysisResult.industrySpecificTips.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Industry-Specific Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.industrySpecificTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {analysisResult.atsOptimizationGaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">ATS Optimization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.atsOptimizationGaps.map((gap, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Search className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Strengths */}
            <TabsContent value="strengths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Resume Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.strengthAreas.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Section Improvement Dialog */}
      {selectedSection && (
        <Dialog open={!!selectedSection} onOpenChange={() => setSelectedSection(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Improve {selectedSection.section} Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Current Issues:</h4>
                <p className="text-sm text-gray-600">{selectedSection.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendations to Address:</h4>
                <ul className="space-y-1">
                  {selectedSection.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedSection(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => sectionImprovementMutation.mutate({
                    resumeContent,
                    sectionName: selectedSection.section,
                    currentContent: "", // Will be extracted from resume content
                    recommendations: selectedSection.recommendations
                  })}
                  disabled={sectionImprovementMutation.isPending}
                >
                  {sectionImprovementMutation.isPending ? "Improving..." : "Generate Improvement"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}