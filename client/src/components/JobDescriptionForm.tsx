import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface JobDescriptionFormProps {
  jobDescription: string;
  setJobDescription: (description: string) => void;
  resumeText: string;
  goToPreviousStep: () => void;
  handleTailorResume: () => Promise<void>;
}

export default function JobDescriptionForm({
  jobDescription,
  setJobDescription,
  resumeText,
  goToPreviousStep,
  handleTailorResume,
}: JobDescriptionFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Enter Job Description</h3>
          <p className="text-sm text-gray-600">
            Copy and paste the full job description to help the AI understand what the employer is looking for.
          </p>
        </div>

        <Textarea
          ref={textareaRef}
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={20}
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary resize-none font-mono text-sm"
          placeholder="Paste the job description here..."
        />
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Resume Summary</h3>
          <p className="text-sm text-gray-600">
            Your uploaded resume will be tailored to match this job description.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 h-full overflow-auto">
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

      <div className="absolute bottom-6 right-6 flex space-x-4">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back
        </Button>

        <Button
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Tailor Resume <i className="fas fa-magic ml-2"></i>
        </Button>
      </div>
    </div>
  );
}
