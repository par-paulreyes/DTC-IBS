"use client";
import { useRouter } from "next/navigation";
import { FaHome, FaCalendarAlt, FaBoxOpen, FaSignOutAlt, FaUserCog } from "react-icons/fa";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div 
              className={`flex items-center space-x-2 cursor-pointer ${isActive('/') ? 'text-blue-600' : 'text-black'}`}
              onClick={() => router.push('/')}
            >
              <FaHome className="text-xl" />
              <span className="font-semibold">Home</span>
            </div>
            <div 
              className={`flex items-center space-x-2 cursor-pointer ${isActive('/schedule') ? 'text-blue-600' : 'text-black'}`}
              onClick={() => router.push('/schedule')}
            >
              <FaCalendarAlt className="text-xl" />
              <span className="font-semibold">Schedule</span>
            </div>
            <div 
              className={`flex items-center space-x-2 cursor-pointer ${isActive('/my-borrow-items') ? 'text-blue-600' : 'text-black'}`}
              onClick={() => router.push('/my-borrow-items')}
            >
              <FaBoxOpen className="text-xl" />
              <span className="font-semibold">My Borrow Items</span>
            </div>
            {user?.role === 'admin' && (
              <div 
                className={`flex items-center space-x-2 cursor-pointer ${isActive('/admin') ? 'text-blue-600' : 'text-black'}`}
                onClick={() => router.push('/admin')}
              >
                <FaUserCog className="text-xl" />
                <span className="font-semibold">Admin</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm text-black">
                {user.email}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 