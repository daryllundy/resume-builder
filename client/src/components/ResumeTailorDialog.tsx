import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileText, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResumeTemplateSelector from "./ResumeTemplateSelector";
import { resumeTemplates } from "@/lib/resumeTemplates";
import type { Resume, JobPost } from "@shared/schema";

interface ResumeTailorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobPost?: JobPost;
}

export default function ResumeTailorDialog({ isOpen, onOpenChange, jobPost }: ResumeTailorDialogProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("chronological");
  const [tailoredResult, setTailoredResult] = useState<{
    originalResume: string;
    tailoredResume: string;
  } | null>(null);
  
  const { toast } = useToast();

  // Fetch user's resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ["/api/resumes"],
    queryFn: () => apiRequest("/api/resumes"),
    enabled: isOpen
  });

  // Tailor resume mutation
  const tailorMutation = useMutation({
    mutationFn: async (data: {
      resumeId: number;
      jobDescription: string;
      jobPostId?: number;
      templateId: string;
    }) => {
      return apiRequest("/api/tailor", "POST", data);
    },
    onSuccess: (data) => {
      setTailoredResult({
        originalResume: data.originalResume,
        tailoredResume: data.tailoredResume
      });
      toast({
        title: "Resume tailored successfully",
        description: "Your resume has been optimized for this job posting.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to tailor resume",
        variant: "destructive",
      });
    }
  });

  const handleTailorResume = () => {
    if (!selectedResumeId || !jobPost) {
      toast({
        title: "Error",
        description: "Please select a resume first",
        variant: "destructive",
      });
      return;
    }

    tailorMutation.mutate({
      resumeId: parseInt(selectedResumeId),
      jobDescription: jobPost.description,
      jobPostId: jobPost.id,
      templateId: selectedTemplateId
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Resume content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsPDF = () => {
    if (!tailoredResult) return;

    // Create HTML content for PDF
    const template = resumeTemplates.find(t => t.id === selectedTemplateId);
    const formattedContent = template ? template.format(tailoredResult.tailoredResume) : tailoredResult.tailoredResume;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Tailored Resume</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          ${formattedContent}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tailored-resume-${jobPost?.company || 'job'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Resume downloaded",
      description: "Your tailored resume has been downloaded as an HTML file.",
    });
  };

  const resetDialog = () => {
    setSelectedResumeId("");
    setSelectedTemplateId("chronological");
    setTailoredResult(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Tailor Resume for {jobPost?.title} at {jobPost?.company}
          </DialogTitle>
        </DialogHeader>

        {!tailoredResult ? (
          <div className="space-y-6">
            {/* Resume Selection */}
            <div className="space-y-2">
              <Label>Select Resume</Label>
              {resumesLoading ? (
                <div className="text-sm text-muted-foreground">Loading resumes...</div>
              ) : resumes.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No resumes found. Please add a resume first.
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

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Resume Template</Label>
              <ResumeTemplateSelector
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={setSelectedTemplateId}
              />
            </div>

            {/* Job Description Preview */}
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {jobPost?.title} at {jobPost?.company}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={jobPost?.description || ""}
                    readOnly
                    className="min-h-[150px] resize-none"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Tailor Button */}
            <Button 
              onClick={handleTailorResume}
              disabled={!selectedResumeId || tailorMutation.isPending}
              className="w-full"
              size="lg"
            >
              {tailorMutation.isPending ? (
                "Tailoring Resume..."
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Tailor Resume
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results */}
            <Tabs defaultValue="tailored" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tailored">Tailored Resume</TabsTrigger>
                <TabsTrigger value="original">Original Resume</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tailored" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Tailored Resume</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(tailoredResult.tailoredResume)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsPDF}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: tailoredResult.tailoredResume }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="original" className="space-y-4">
                <h3 className="text-lg font-semibold">Original Resume</h3>
                <Card>
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-sm">
                      {tailoredResult.originalResume}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={resetDialog}
                className="flex-1"
              >
                Tailor Another Resume
              </Button>
              <Button
                onClick={() => handleClose(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}