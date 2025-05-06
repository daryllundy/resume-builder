import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-primary p-1.5 rounded-lg">
                <i className="fas fa-file-alt text-2xl"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Resume Tailor</h1>
            </div>
          </Link>
        </div>
        <nav className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className={`text-sm font-medium ${location === '/' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors cursor-pointer`}>
                Resume Builder
              </div>
            </Link>
            <Link href="/jobs">
              <div className={`text-sm font-medium ${location === '/jobs' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors cursor-pointer`}>
                Job Board
              </div>
            </Link>
          </div>
          {location === '/' && (
            <div className="hidden md:flex items-center space-x-4">
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-primary transition-colors">How It Works</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-primary transition-colors">FAQ</a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
