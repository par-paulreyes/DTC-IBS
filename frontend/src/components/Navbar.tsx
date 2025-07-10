"use client";
import { useRouter } from "next/navigation";
import { FaHome, FaCalendarAlt, FaSignOutAlt, FaUserCog, FaBoxOpen, FaBars, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (typeof window !== "undefined") {
      return window.location.pathname === path;
    }
    return false;
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#162C49] shadow-2xl border-b-2 border-blue-600 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <div 
              className={`flex items-center space-x-2 cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                isActive('/') 
                  ? 'text-white bg-blue-600/20' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
              }`}
              onClick={() => handleNavClick('/')}
            >
              <FaHome className="text-lg lg:text-xl" />
              <span className="font-semibold text-sm lg:text-base">Home</span>
            </div>
            <div 
              className={`flex items-center space-x-2 cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                isActive('/schedule') 
                  ? 'text-white bg-blue-600/20' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
              }`}
              onClick={() => handleNavClick('/schedule')}
            >
              <FaCalendarAlt className="text-lg lg:text-xl" />
              <span className="font-semibold text-sm lg:text-base">Schedule</span>
            </div>
            <div 
              className={`flex items-center space-x-2 cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                isActive('/my-borrow-items') 
                  ? 'text-white bg-blue-600/20' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
              }`}
              onClick={() => handleNavClick('/my-borrow-items')}
            >
              <FaBoxOpen className="text-lg lg:text-xl" />
              <span className="font-semibold text-sm lg:text-base">My Items</span>
            </div>
            {user?.role === 'admin' && (
              <div 
                className={`flex items-center space-x-2 cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                  isActive('/admin') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={() => handleNavClick('/admin')}
              >
                <FaUserCog className="text-lg lg:text-xl" />
                <span className="font-semibold text-sm lg:text-base">Admin</span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-600/10 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>

          {/* Desktop User Info and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="text-sm text-blue-100 font-medium max-w-xs truncate">
                {user.email}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-300 hover:text-red-100 hover:bg-red-600/20 px-3 py-2 rounded-lg transition-all duration-300"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="text-sm lg:text-base">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#162C49] shadow-2xl border-b-2 border-blue-600">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Links */}
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={() => handleNavClick('/')}
              >
                <FaHome className="text-xl" />
                <span className="font-semibold">Home</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive('/schedule') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={() => handleNavClick('/schedule')}
              >
                <FaCalendarAlt className="text-xl" />
                <span className="font-semibold">Schedule</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive('/my-borrow-items') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={() => handleNavClick('/my-borrow-items')}
              >
                <FaBoxOpen className="text-xl" />
                <span className="font-semibold">My Borrow Items</span>
              </div>
              {user?.role === 'admin' && (
                <div 
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                    isActive('/admin') 
                      ? 'text-white bg-blue-600/20' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                  }`}
                  onClick={() => handleNavClick('/admin')}
                >
                  <FaUserCog className="text-xl" />
                  <span className="font-semibold">Admin</span>
                </div>
              )}
              
              {/* Mobile User Info and Logout */}
              <div className="border-t border-blue-600 pt-4 mt-4">
                {user && (
                  <div className="text-sm text-blue-100 font-medium p-3 mb-2 bg-blue-600/10 rounded-lg">
                    {user.email}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 text-red-300 hover:text-red-100 hover:bg-red-600/20 p-3 rounded-lg transition-all duration-300 w-full"
                >
                  <FaSignOutAlt className="text-xl" />
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 