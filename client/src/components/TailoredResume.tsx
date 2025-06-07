import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getTemplateById } from "@/lib/resumeTemplates";
import ResumeImprover from "./ResumeImprover";

interface TailoredResumeProps {
  originalResume: string;
  tailoredResume: string;
  goToPreviousStep: () => void;
  startOver: () => void;
  downloadPDF: () => void;
  copyToClipboard: () => void;
  selectedTemplateId?: string;
}

export default function TailoredResume({
  originalResume,
  tailoredResume,
  goToPreviousStep,
  startOver,
  downloadPDF,
  copyToClipboard,
  selectedTemplateId = "chronological",
}: TailoredResumeProps) {
  const tailoredResumeRef = useRef<HTMLDivElement>(null);

  // Get the template information to display
  const template = getTemplateById(selectedTemplateId);

  return (
    <div className="relative flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Original Resume</h3>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50 h-[300px] sm:h-96 overflow-auto">
          <div className="prose max-w-none text-sm whitespace-pre-wrap">
            {originalResume || "No original resume content found."}
          </div>
        </div>
      </div>

      <div className="flex-1 mt-6 lg:mt-0">
        <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">Tailored Resume</h3>
            <Badge variant="outline" className="border-primary text-primary">
              {template.name} Style
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <i className="fas fa-copy mr-1"></i> Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <i className="fas fa-download mr-1"></i> PDF
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white h-[300px] sm:h-96 overflow-auto shadow-sm">
          <div 
            ref={tailoredResumeRef}
            id="tailoredResumeText" 
            className="prose max-w-none text-sm"
          >
            {tailoredResume ? (
              <div dangerouslySetInnerHTML={{ __html: tailoredResume }} />
            ) : (
              <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
                <i className="fas fa-file-alt text-4xl mb-2"></i>
                <p className="text-sm">No tailored resume generated yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="static mt-8 lg:absolute lg:bottom-6 lg:right-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i className="fas fa-arrow-left mr-2 hidden sm:inline-block"></i> Edit Job Description
        </Button>

        <Button
          variant="outline"
          onClick={startOver}
          className="px-4 py-2 border border-primary bg-white text-primary rounded-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i className="fas fa-redo mr-2 hidden sm:inline-block"></i> Start Over
        </Button>
      </div>
    </div>
  );
}
