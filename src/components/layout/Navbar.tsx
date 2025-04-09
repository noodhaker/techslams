
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-tech-primary">Tech</span>
                <span className="text-2xl font-bold text-tech-secondary">Help</span>
                <span className="text-2xl font-bold text-tech-accent">Circle</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-tech-primary hover:text-tech-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/questions" className="border-transparent text-gray-500 hover:border-tech-primary hover:text-tech-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Questions
              </Link>
              <Link to="/tags" className="border-transparent text-gray-500 hover:border-tech-primary hover:text-tech-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Tags
              </Link>
              <Link to="/users" className="border-transparent text-gray-500 hover:border-tech-primary hover:text-tech-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Users
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search questions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-tech-primary focus:border-tech-primary sm:text-sm"
              />
            </div>
            
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
            
            <Link to="/ask">
              <Button className="bg-tech-primary hover:bg-tech-secondary">
                <PlusCircle className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tech-primary"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="text-tech-primary hover:bg-tech-light block pl-3 pr-4 py-2 border-l-4 border-tech-primary text-base font-medium">
              Home
            </Link>
            <Link to="/questions" className="text-gray-500 hover:bg-tech-light hover:border-tech-primary block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
              Questions
            </Link>
            <Link to="/tags" className="text-gray-500 hover:bg-tech-light hover:border-tech-primary block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
              Tags
            </Link>
            <Link to="/users" className="text-gray-500 hover:bg-tech-light hover:border-tech-primary block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
              Users
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-tech-primary flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">User Name</div>
                <div className="text-sm font-medium text-gray-500">user@example.com</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Your Profile
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Settings
              </Link>
              <Link to="/ask" className="block px-4 py-2 text-base font-medium text-tech-primary hover:text-tech-secondary">
                Ask Question
              </Link>
              <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
