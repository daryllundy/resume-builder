export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <div className="text-primary mr-2">
                <i className="fas fa-file-alt text-xl"></i>
              </div>
              <span className="text-lg font-semibold text-gray-800">Resume Tailor</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Helping you land your dream job, one resume at a time.</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="fab fa-github text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            &copy; {currentYear} Resume Tailor. All rights reserved.
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap space-x-4">
            <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
