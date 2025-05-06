import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "@/hooks/use-toast";

interface ResumeFormProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  handleResumeUpload: (file: File) => Promise<void>;
  goToNextStep: () => void;
}

export default function ResumeForm({ 
  resumeText, 
  setResumeText, 
  handleResumeUpload, 
  goToNextStep 
}: ResumeFormProps) {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsPreviewLoading(true);
      await handleResumeUpload(file);
      setIsPreviewLoading(false);
    } catch (error) {
      setIsPreviewLoading(false);
      toast({
        title: "Error uploading file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume required",
        description: "Please enter or upload your resume before continuing.",
        variant: "destructive",
      });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }
    goToNextStep();
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Upload Your Resume</h3>
        
        <FileUpload
          onFileSelected={handleFileUpload}
          accept=".pdf,.txt,.doc,.docx"
          maxSize={5 * 1024 * 1024} // 5MB max
        />

        <div className="mt-4">
          <div className="flex flex-col sm:flex-row justify-between mb-2">
            <label htmlFor="resumeText" className="block text-sm font-medium text-gray-700">Paste Resume Text</label>
            <span className="text-xs text-gray-500">Or edit uploaded content</span>
          </div>
          <Textarea
            ref={textareaRef}
            id="resumeText"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary resize-none font-mono text-sm"
            placeholder="Paste your resume content here or upload a file above..."
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-6 lg:mt-0">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Preview</h3>
        <div className="flex-1 border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50 overflow-auto h-[300px] sm:h-96">
          {isPreviewLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Parsing resume...</span>
            </div>
          ) : resumeText ? (
            <div className="prose max-w-none text-sm whitespace-pre-wrap">
              {resumeText}
            </div>
          ) : (
            <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
              <i className="fas fa-file-alt text-4xl mb-2"></i>
              <p className="text-sm">Your resume preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="static mt-8 lg:absolute lg:bottom-6 lg:right-6 flex justify-end">
        <Button 
          onClick={handleNext}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Next <span className="hidden sm:inline">: Add Job Description</span> <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );
}
