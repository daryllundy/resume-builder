export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <h3 className="text-lg font-medium text-center text-gray-800 mb-1">Tailoring Your Resume</h3>
        <p className="text-sm text-center text-gray-600">AI is analyzing your resume and the job description to highlight your most relevant skills and experience.</p>
      </div>
    </div>
  );
}
