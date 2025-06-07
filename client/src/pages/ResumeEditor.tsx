import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, FileText, Eye, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InteractiveResumeEditor from "@/components/InteractiveResumeEditor";
import type { Resume } from "@shared/schema";

export default function ResumeEditor() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/resume-editor/:id");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const resumeId = params?.id ? parseInt(params.id) : null;

  // Fetch resume data
  const { data: resume, isLoading } = useQuery({
    queryKey: ["/api/resumes", resumeId],
    queryFn: () => apiRequest(`/api/resumes/${resumeId}`),
    enabled: !!resumeId
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error("Failed to update resume");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Resume Saved",
        description: "Your resume has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save resume",
        variant: "destructive",
      });
    }
  });

  // Initialize content when resume loads
  useEffect(() => {
    if (resume?.content && !currentContent) {
      setCurrentContent(resume.content);
    }
  }, [resume, currentContent]);

  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    setHasUnsavedChanges(content !== (resume?.content || ""));
  };

  const handleSave = () => {
    if (resumeId && currentContent) {
      updateResumeMutation.mutate(currentContent);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        setLocation("/resume-builder");
      }
    } else {
      setLocation("/resume-builder");
    }
  };

  if (!resumeId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No resume selected for editing.</p>
            <Button 
              onClick={() => setLocation("/resume-builder")} 
              className="mt-4"
            >
              Back to Resume Builder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Resume not found.</p>
            <Button 
              onClick={() => setLocation("/resume-builder")} 
              className="mt-4"
            >
              Back to Resume Builder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit Resume: {resume.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {resume.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Default Resume
                    </Badge>
                  )}
                  {hasUnsavedChanges && (
                    <Badge variant="secondary" className="text-xs">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || updateResumeMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateResumeMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="container mx-auto px-4 py-6">
        <InteractiveResumeEditor
          initialContent={resume.content}
          onContentChange={handleContentChange}
          onSave={handleSave}
        />
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="shadow-lg border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    You have unsaved changes
                  </p>
                  <p className="text-xs text-amber-600">
                    Don't forget to save your work
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateResumeMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}