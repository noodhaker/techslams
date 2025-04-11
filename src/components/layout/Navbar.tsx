
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Laptop, Menu, X, User, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobileDetection } from "@/hooks/use-mobile";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobileDetection();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Laptop className="h-6 w-6 text-tech-primary" />
              <span className="ml-2 text-lg font-semibold text-gray-900">DevHelpDeck</span>
            </Link>
            {!isMobile && (
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `py-2 text-sm font-medium ${
                      isActive
                        ? "text-tech-primary border-b-2 border-tech-primary"
                        : "text-gray-500 hover:text-gray-900"
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/questions"
                  className={({ isActive }) =>
                    `py-2 text-sm font-medium ${
                      isActive
                        ? "text-tech-primary border-b-2 border-tech-primary"
                        : "text-gray-500 hover:text-gray-900"
                    }`
                  }
                >
                  Questions
                </NavLink>
                <NavLink
                  to="/tags"
                  className={({ isActive }) =>
                    `py-2 text-sm font-medium ${
                      isActive
                        ? "text-tech-primary border-b-2 border-tech-primary"
                        : "text-gray-500 hover:text-gray-900"
                    }`
                  }
                >
                  Tags
                </NavLink>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `py-2 text-sm font-medium ${
                      isActive
                        ? "text-tech-primary border-b-2 border-tech-primary"
                        : "text-gray-500 hover:text-gray-900"
                    }`
                  }
                >
                  Users
                </NavLink>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!user && !isMobile && (
              <div className="hidden md:flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")}>
                  Sign up
                </Button>
              </div>
            )}

            {user && (
              <>
                <Link to="/ask">
                  <Button size="sm" className="hidden md:flex">
                    Ask Question
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1 rounded-full md:p-2">
                      <Avatar className="h-8 w-8 md:h-8 md:w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-tech-light text-tech-primary">
                          <User className="h-4 w-4 md:h-5 md:w-5" />
                        </AvatarFallback>
                      </Avatar>
                      {!isMobile && (
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.username || user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs bg-tech-light text-tech-primary">
                          Level 1
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <button
              className="md:hidden p-2 rounded-md focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-500" />
              ) : (
                <Menu className="h-6 w-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "text-tech-primary bg-tech-light"
                    : "text-gray-700 hover:text-tech-primary hover:bg-gray-50"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/questions"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "text-tech-primary bg-tech-light"
                    : "text-gray-700 hover:text-tech-primary hover:bg-gray-50"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Questions
            </NavLink>
            <NavLink
              to="/tags"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "text-tech-primary bg-tech-light"
                    : "text-gray-700 hover:text-tech-primary hover:bg-gray-50"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Tags
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "text-tech-primary bg-tech-light"
                    : "text-gray-700 hover:text-tech-primary hover:bg-gray-50"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Users
            </NavLink>
            
            {user && (
              <NavLink
                to="/ask"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-tech-primary hover:bg-tech-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Ask Question
              </NavLink>
            )}

            {!user && (
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button
                  className="w-full justify-center"
                  onClick={() => {
                    navigate("/signup");
                    setIsMenuOpen(false);
                  }}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
