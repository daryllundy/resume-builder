interface StepIndicatorProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function StepIndicator({ currentStep, setCurrentStep }: StepIndicatorProps) {
  const steps = [
    { id: 1, name: "Input Resume" },
    { id: 2, name: "Add Job Description" },
    { id: 3, name: "View Tailored Resume" },
  ];

  const handleStepClick = (stepId: number) => {
    // Only allow going to previous steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex-1 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
                currentStep === step.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              aria-current={currentStep === step.id ? "page" : undefined}
            >
              <span className="block sm:inline">{step.id}.</span>{" "}
              <span className="hidden xs:inline sm:inline">{step.name}</span>
              <span className="xs:hidden">
                {step.id === 1 ? "Resume" : step.id === 2 ? "Job" : "Result"}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
