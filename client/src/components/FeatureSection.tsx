export default function FeatureSection() {
  return (
    <section className="mt-16" id="how-it-works">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-primary mb-4 flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mx-auto">
            <i className="fas fa-file-import text-xl"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2 text-center">Upload Your Resume</h3>
          <p className="text-gray-600 text-center">Upload your existing resume in PDF or text format, or simply paste your resume content directly.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-primary mb-4 flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mx-auto">
            <i className="fas fa-briefcase text-xl"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2 text-center">Add Job Description</h3>
          <p className="text-gray-600 text-center">Paste the full job description from the position you're applying for to help our AI understand what's required.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-primary mb-4 flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mx-auto">
            <i className="fas fa-magic text-xl"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2 text-center">Get Tailored Results</h3>
          <p className="text-gray-600 text-center">Our AI analyzes both documents and creates a customized version of your resume that highlights your most relevant qualifications.</p>
        </div>
      </div>
    </section>
  );
}
