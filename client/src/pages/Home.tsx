import { useState } from "react";
import ResumeForm from "@/components/ResumeForm";
import JobDescriptionForm from "@/components/JobDescriptionForm";
import TailoredResume from "@/components/TailoredResume";
import LoadingOverlay from "@/components/LoadingOverlay";
import FeatureSection from "@/components/FeatureSection";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import StepIndicator from "@/components/StepIndicator";
import { useResumeTailor } from "@/hooks/useResumeTailor";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const {
    resumeText, 
    setResumeText,
    jobDescription,
    setJobDescription,
    tailoredResumeText,
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading,
    tailorResume,
    handleResumeUpload,
    downloadPDF,
    copyToClipboard
  } = useResumeTailor();

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startOver = () => {
    setCurrentStep(1);
  };

  const handleTailorResume = async () => {
    await tailorResume();
    goToNextStep();
  };

  return (
    <>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction Section */}
        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Tailor Your Resume to Match the Job</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume, paste the job description, and let AI tailor your qualifications to highlight the most relevant skills and experience.
          </p>
        </section>

        {/* Main Workflow */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} />

          <div className="p-4 md:p-6">
            {currentStep === 1 && (
              <ResumeForm 
                resumeText={resumeText} 
                setResumeText={setResumeText} 
                handleResumeUpload={handleResumeUpload}
                goToNextStep={goToNextStep}
              />
            )}

            {currentStep === 2 && (
              <JobDescriptionForm 
                jobDescription={jobDescription} 
                setJobDescription={setJobDescription}
                resumeText={resumeText}
                goToPreviousStep={goToPreviousStep}
                handleTailorResume={handleTailorResume}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
              />
            )}

            {currentStep === 3 && (
              <TailoredResume 
                originalResume={resumeText}
                tailoredResume={tailoredResumeText}
                goToPreviousStep={goToPreviousStep}
                startOver={startOver}
                downloadPDF={downloadPDF}
                copyToClipboard={copyToClipboard}
                selectedTemplateId={selectedTemplateId}
              />
            )}
          </div>
        </div>

        <FeatureSection />
        <Testimonials />
        <FAQ />
      </main>
      
      {isLoading && <LoadingOverlay />}
    </>
  );
}
