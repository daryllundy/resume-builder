import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface TailoredResumeProps {
  originalResume: string;
  tailoredResume: string;
  goToPreviousStep: () => void;
  startOver: () => void;
  downloadPDF: () => void;
  copyToClipboard: () => void;
}

export default function TailoredResume({
  originalResume,
  tailoredResume,
  goToPreviousStep,
  startOver,
  downloadPDF,
  copyToClipboard,
}: TailoredResumeProps) {
  const tailoredResumeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Original Resume</h3>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 h-96 overflow-auto">
          <div className="prose max-w-none text-sm whitespace-pre-wrap">
            {originalResume || "No original resume content found."}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Tailored Resume</h3>
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

        <div className="border border-gray-200 rounded-lg p-6 bg-white h-96 overflow-auto shadow-sm">
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

      <div className="absolute bottom-6 right-6 flex space-x-4">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i className="fas fa-arrow-left mr-2"></i> Edit Job Description
        </Button>

        <Button
          variant="outline"
          onClick={startOver}
          className="px-4 py-2 border border-primary bg-white text-primary rounded-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i className="fas fa-redo mr-2"></i> Start Over
        </Button>
      </div>
    </div>
  );
}
