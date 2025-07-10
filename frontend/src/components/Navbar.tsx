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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        console.log('Click outside detected, closing menu');
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
    console.log('Navigating to:', path); // Debug log
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleNavClickWithEvent = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigating to:', path); // Debug log
    try {
      router.push(path);
      console.log('Router push successful');
    } catch (error) {
      console.error('Router push failed:', error);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMobileMenuOpen(false);
          }}
        />
      )}

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
                onClick={(e) => handleNavClickWithEvent('/', e)}
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
                onClick={(e) => handleNavClickWithEvent('/schedule', e)}
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
                onClick={(e) => handleNavClickWithEvent('/my-borrow-items', e)}
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
                  onClick={(e) => handleNavClickWithEvent('/admin', e)}
                >
                  <FaUserCog className="text-lg lg:text-xl" />
                  <span className="font-semibold text-sm lg:text-base">Admin</span>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden mobile-menu-button">
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
        </div>

        {/* Mobile Side Navigation */}
        <div 
          className={`mobile-menu fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#162C49] shadow-2xl border-r-2 border-blue-600 transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-blue-600">
              <h2 className="text-white font-bold text-lg">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-600/10 transition-all duration-300"
                aria-label="Close mobile menu"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-6 space-y-2">
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={(e) => handleNavClickWithEvent('/', e)}
              >
                <FaHome className="text-xl" />
                <span className="font-semibold text-base">Home</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive('/schedule') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={(e) => handleNavClickWithEvent('/schedule', e)}
              >
                <FaCalendarAlt className="text-xl" />
                <span className="font-semibold text-base">Schedule</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive('/my-borrow-items') 
                    ? 'text-white bg-blue-600/20' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                }`}
                onClick={(e) => handleNavClickWithEvent('/my-borrow-items', e)}
              >
                <FaBoxOpen className="text-xl" />
                <span className="font-semibold text-base">My Borrow Items</span>
              </div>
              {user?.role === 'admin' && (
                <div 
                  className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    isActive('/admin') 
                      ? 'text-white bg-blue-600/20' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-600/10'
                  }`}
                  onClick={(e) => handleNavClickWithEvent('/admin', e)}
                >
                  <FaUserCog className="text-xl" />
                  <span className="font-semibold text-base">Admin</span>
                </div>
              )}
            </div>
            
            {/* User Info and Logout */}
            <div className="border-t border-blue-600 p-4">
              {user && (
                <div className="text-sm text-blue-100 font-medium p-3 mb-3 bg-blue-600/10 rounded-lg">
                  {user.email}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-red-300 hover:text-red-100 hover:bg-red-600/20 p-4 rounded-lg transition-all duration-300 w-full"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="font-semibold text-base">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
} 