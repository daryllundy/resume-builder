import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Wand2, Plus, Upload, BarChart3, History, Sparkles, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ResumeManager from "../components/ResumeManager";
import TailoringHistory from "../components/TailoringHistory";
import ResumeScoreCard from "../components/ResumeScoreCard";
import ResumeTailorDialog from "../components/ResumeTailorDialog";
import EliteResumeTailor from "../components/EliteResumeTailor";
import InteractiveResumeEditor from "../components/InteractiveResumeEditor";
import TemplateGenerator from "../components/TemplateGenerator";
import ResumeGapAnalyzer from "../components/ResumeGapAnalyzer";
import type { Resume, JobPost } from "@shared/schema";

export default function ResumeBuilder() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [tailorMode, setTailorMode] = useState<"existing-job" | "custom">("existing-job");
  const [tailorDialogOpen, setTailorDialogOpen] = useState(false);
  const [selectedJobForTailoring, setSelectedJobForTailoring] = useState<JobPost | undefined>();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ["/api/resumes"],
    queryFn: () => apiRequest("/api/resumes")
  });

  // Fetch user's jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: () => apiRequest("/api/jobs")
  });

  // Create resume from generated template
  const createResumeMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return await apiRequest('/api/resumes', 'POST', data);
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      toast({
        title: "Resume Created Successfully",
        description: `New resume "${newResume.title}" has been added to your library`,
      });
      setSelectedResumeId(newResume.id.toString());
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Resume",
        description: error instanceof Error ? error.message : "Unable to create resume",
        variant: "destructive"
      });
    }
  });

  const handleTailorResume = () => {
    if (!selectedResumeId) return;

    if (tailorMode === "existing-job" && selectedJobId) {
      const selectedJob = jobs.find((job: JobPost) => job.id.toString() === selectedJobId);
      setSelectedJobForTailoring(selectedJob);
      setTailorDialogOpen(true);
    } else if (tailorMode === "custom" && customJobDescription.trim()) {
      // Create a temporary job post for custom job description
      const tempJobPost: JobPost = {
        id: 0,
        userId: 1,
        title: "Custom Job",
        company: "Custom Company",
        description: customJobDescription,
        location: "",
        url: null,
        status: "applied",
        dateAdded: new Date(),
        dateModified: new Date(),
        deadline: null,
        notes: ""
      };
      setSelectedJobForTailoring(tempJobPost);
      setTailorDialogOpen(true);
    }
  };

  const selectedResume = resumes.find((resume: Resume) => resume.id.toString() === selectedResumeId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="mt-2 text-gray-600">
            Manage your resume library, analyze performance, and tailor resumes for specific opportunities
          </p>
        </div>

        <Tabs defaultValue="resumes" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="resumes" className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              Library
            </TabsTrigger>
            <TabsTrigger value="tailor" className="flex items-center gap-1 text-xs">
              <Wand2 className="h-3 w-3" />
              Tailor
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-1 text-xs">
              <Search className="h-3 w-3" />
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
              <History className="h-3 w-3" />
              History
            </TabsTrigger>
            <TabsTrigger value="elite" className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Elite
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              Editor
            </TabsTrigger>
          </TabsList>

          {/* Resume Library Tab */}
          <TabsContent value="resumes" className="space-y-6">
            <div className="grid gap-6">
              {/* Template Generator Card */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI-Powered Template Generator
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    Generate professional resume templates tailored to your industry and experience level using AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TemplateGenerator 
                    onTemplateGenerated={(content) => {
                      // Create a new resume from the generated template
                      const templateTitle = `AI Generated Resume - ${new Date().toLocaleDateString()}`;
                      createResumeMutation.mutate({
                        title: templateTitle,
                        content: content
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Existing Resume Manager */}
              <ResumeManager 
                selectedResumeId={selectedResumeId ? parseInt(selectedResumeId) : undefined}
                onResumeSelect={(id) => setSelectedResumeId(id.toString())}
              />
            </div>
          </TabsContent>

          {/* Tailor Resume Tab */}
          <TabsContent value="tailor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Tailor Resume to Job
                </CardTitle>
                <CardDescription>
                  Select a resume and job description to create a tailored version optimized for specific opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Selection */}
                <div className="space-y-2">
                  <Label htmlFor="resume-select">Select Resume</Label>
                  {resumesLoading ? (
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  ) : resumes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No resumes uploaded yet</p>
                      <p className="text-sm">Upload a resume in the Resume Library tab first</p>
                    </div>
                  ) : (
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a resume to tailor" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume: Resume) => (
                          <SelectItem key={resume.id} value={resume.id.toString()}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {resume.title}
                              {resume.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Job Selection Mode */}
                {selectedResumeId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Job Description Source</Label>
                      <Tabs value={tailorMode} onValueChange={(value) => setTailorMode(value as any)}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="existing-job">From Job Board</TabsTrigger>
                          <TabsTrigger value="custom">Custom Description</TabsTrigger>
                        </TabsList>

                        <TabsContent value="existing-job" className="space-y-4 mt-4">
                          {jobsLoading ? (
                            <div className="h-10 bg-gray-100 rounded animate-pulse" />
                          ) : jobs.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                              <Plus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p>No jobs in your board yet</p>
                              <p className="text-sm">Add jobs to your board to tailor resumes for them</p>
                            </div>
                          ) : (
                            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a job from your board" />
                              </SelectTrigger>
                              <SelectContent>
                                {jobs.map((job: JobPost) => (
                                  <SelectItem key={job.id} value={job.id.toString()}>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{job.title}</span>
                                      <span className="text-sm text-gray-500">{job.company}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-job-description">Job Description</Label>
                            <Textarea
                              id="custom-job-description"
                              placeholder="Paste the job description here..."
                              value={customJobDescription}
                              onChange={(e) => setCustomJobDescription(e.target.value)}
                              rows={8}
                              className="resize-none"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Tailor Button */}
                    <Button 
                      onClick={handleTailorResume}
                      disabled={
                        !selectedResumeId || 
                        (tailorMode === "existing-job" && !selectedJobId) ||
                        (tailorMode === "custom" && !customJobDescription.trim())
                      }
                      className="w-full"
                      size="lg"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Tailor Resume
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI-Powered Resume Analysis
                </CardTitle>
                <CardDescription>
                  Get detailed insights on your resume's impact, ATS compatibility, and job match potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedResumeId ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a resume from the Resume Library to analyze</p>
                  </div>
                ) : selectedResume ? (
                  <ResumeScoreCard 
                    resumeContent={selectedResume.content}
                    showJobMatch={false}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gap Analysis Tab */}
          <TabsContent value="gaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Smart Resume Gap Analysis
                </CardTitle>
                <CardDescription>
                  Identify missing sections, content weaknesses, and get targeted improvement recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedResumeId ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a resume from the Resume Library to analyze gaps</p>
                  </div>
                ) : selectedResume ? (
                  <ResumeGapAnalyzer 
                    resumeContent={selectedResume.content}
                    onSectionImprovement={(section, improvedContent) => {
                      // Handle section improvement callback if needed
                      console.log(`Improved ${section}:`, improvedContent.substring(0, 100) + "...");
                    }}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tailoring History Tab */}
          <TabsContent value="history" className="space-y-6">
            <TailoringHistory />
          </TabsContent>

          {/* Elite Optimization Tab */}
          <TabsContent value="elite" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Elite Resume Optimization
                </CardTitle>
                <CardDescription>
                  Advanced AI-powered resume analysis and optimization using professional consulting methodologies for maximum ATS compatibility and recruiter appeal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedResumeId ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a resume from the Resume Library to begin elite optimization</p>
                  </div>
                ) : !customJobDescription.trim() ? (
                  <div className="space-y-4">
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Add a job description to perform elite optimization analysis</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-description">Job Description</Label>
                      <Textarea
                        id="job-description"
                        value={customJobDescription}
                        onChange={(e) => setCustomJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here for comprehensive analysis..."
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>
                ) : selectedResume ? (
                  <EliteResumeTailor
                    resumeContent={selectedResume.content}
                    jobDescription={customJobDescription}
                    onOptimizedResume={(optimizedResume) => {
                      // Handle the optimized resume if needed
                      console.log("Received optimized resume:", optimizedResume.substring(0, 100) + "...");
                    }}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactive Resume Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <InteractiveResumeEditor
              initialContent={selectedResume?.content || ''}
              onContentChange={(content) => {
                // Update the resume content in real-time if needed
                console.log("Resume content updated:", content.substring(0, 100) + "...");
              }}
              onSave={(content) => {
                // Handle saving the edited resume
                if (selectedResumeId && selectedResume) {
                  // Could implement save functionality here
                  console.log("Saving resume:", content.substring(0, 100) + "...");
                }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Resume Tailor Dialog */}
        <ResumeTailorDialog
          isOpen={tailorDialogOpen}
          onOpenChange={setTailorDialogOpen}
          jobPost={selectedJobForTailoring}
        />
      </div>
    </div>
  );
}