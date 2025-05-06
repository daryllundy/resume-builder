export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-primary p-1.5 rounded-lg">
            <i className="fas fa-file-alt text-2xl"></i>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Resume Tailor</h1>
        </div>
        <div>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-primary transition-colors">How It Works</a>
          <span className="mx-2 text-gray-300">|</span>
          <a href="#faq" className="text-sm text-gray-600 hover:text-primary transition-colors">FAQ</a>
        </div>
      </div>
    </header>
  );
}
