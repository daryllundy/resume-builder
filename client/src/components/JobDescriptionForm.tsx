import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import ResumeTemplateSelector from "./ResumeTemplateSelector";

interface JobDescriptionFormProps {
  jobDescription: string;
  setJobDescription: (description: string) => void;
  resumeText: string;
  goToPreviousStep: () => void;
  handleTailorResume: () => Promise<void>;
  selectedTemplateId: string;
  setSelectedTemplateId: (templateId: string) => void;
}

export default function JobDescriptionForm({
  jobDescription,
  setJobDescription,
  resumeText,
  goToPreviousStep,
  handleTailorResume,
  selectedTemplateId,
  setSelectedTemplateId,
}: JobDescriptionFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const saveJobMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      company: string;
      location: string;
      description: string;
      url: string;
    }) => {
      await apiRequest("POST", "/api/job-description/save", data);
    },
    onSuccess: () => {
      toast({
        title: "Job saved",
        description: "The job has been added to your job board.",
      });
      setIsSaveDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving job",
        description: error instanceof Error ? error.message : "Failed to save job.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter the job description before continuing.",
        variant: "destructive",
      });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }
    await handleTailorResume();
  };

  const handleSaveJob = () => {
    if (!jobTitle || !company) {
      toast({
        title: "Missing information",
        description: "Job title and company name are required.",
        variant: "destructive",
      });
      return;
    }

    saveJobMutation.mutate({
      title: jobTitle,
      company,
      location,
      description: jobDescription,
      url: jobUrl,
    });
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Enter Job Description</h3>
            <p className="text-sm text-gray-600">
              Copy and paste the full job description to help the AI understand what the employer is looking for.
            </p>
          </div>
          
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-primary border-primary hover:bg-primary/5 whitespace-nowrap"
              >
                <i className="fas fa-save mr-2"></i> Save to Job Board
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[90vw] w-full">
              <DialogHeader>
                <DialogTitle>Save to Job Board</DialogTitle>
                <DialogDescription>
                  Add this job to your job board to track your application process.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="jobTitle" className="sm:text-right">
                    Job Title *
                  </Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="sm:col-span-3"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="company" className="sm:text-right">
                    Company *
                  </Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="sm:col-span-3"
                    placeholder="e.g. Acme Inc."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="location" className="sm:text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="sm:col-span-3"
                    placeholder="e.g. San Francisco, CA (Remote)"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="jobUrl" className="sm:text-right">
                    Job URL
                  </Label>
                  <Input
                    id="jobUrl"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="sm:col-span-3"
                    placeholder="https://example.com/job-posting"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveJob} disabled={saveJobMutation.isPending}>
                  {saveJobMutation.isPending ? (
                    <>
                      <span className="mr-2">Saving</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    </>
                  ) : "Save Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Textarea
          ref={textareaRef}
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={12}
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary resize-none font-mono text-sm"
          placeholder="Paste the job description here..."
        />
        
        <div className="mt-2 flex justify-end">
          <Link href="/jobs">
            <div className="text-sm text-primary hover:text-primary/80 cursor-pointer">
              View Job Board <i className="fas fa-external-link-alt ml-1"></i>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex-1 mt-6 lg:mt-0">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Resume Style & Preview</h3>
          <p className="text-sm text-gray-600">
            Select a style for your resume and preview before tailoring.
          </p>
        </div>
        
        {/* Template selector */}
        <ResumeTemplateSelector 
          selectedTemplateId={selectedTemplateId} 
          onTemplateSelect={setSelectedTemplateId} 
        />

        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50 h-full max-h-[400px] lg:max-h-none overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Your Current Resume</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousStep}
              className="text-sm text-primary hover:text-primary/90 focus:outline-none"
            >
              <i className="fas fa-edit mr-1"></i> Edit
            </Button>
          </div>

          <div className="prose max-w-none text-xs text-gray-600 line-clamp-15 whitespace-pre-wrap">
            {resumeText || "No resume uploaded."}
          </div>
        </div>
      </div>

      <div className="static mt-8 lg:absolute lg:bottom-6 lg:right-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i className="fas fa-arrow-left mr-2 hidden sm:inline-block"></i> Back
        </Button>

        <Button
          onClick={handleSubmit}
          className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Tailor Resume <i className="fas fa-magic ml-2 hidden sm:inline-block"></i>
        </Button>
      </div>
    </div>
  );
}
