"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBoxOpen, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
    if (!emailPattern.test(email)) {
      setError("Email must be in format: XX-XXXXX@g.batstate-u.edu.ph (e.g., 22-00869@g.batstate-u.edu.ph)");
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#e9ecf4]">
      {/* Left Side - Info with creative overlay */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-cover bg-center relative" style={{backgroundImage: 'url(/dtc-bg.png)'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-primaryBlue/90 via-primaryBlue/80 to-primaryRed/80"></div>
        <div className="relative z-10 flex flex-col justify-center px-6 sm:px-12 h-full text-white">
          <div className="flex items-center mb-6 sm:mb-8">
            <FaBoxOpen className="w-8 h-8 sm:w-12 sm:h-12 mr-3 sm:mr-4 text-white" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold whitespace-nowrap text-white">Inventory Access System</h1>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light mb-4 sm:mb-6 text-white">Digital Transformation Center</h2>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 text-white">Streamline your inventory operations with our comprehensive tracking and borrowing system.</p>
          <div className="space-y-3 sm:space-y-4 text-white">
            <div className="flex items-start text-white">
              <FaMapMarkerAlt className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 mt-1 flex-shrink-0 text-white" />
              <span className="text-sm sm:text-base text-white">2F STEER Hub Bldg., Batangas State University, TNEU - Alangilan Campus, Golden Country Homes, Alangilan, Batangas City</span>
            </div>
            <div className="flex items-center text-white">
              <FaEnvelope className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0 text-white" />
              <span className="text-sm sm:text-base text-white">dtc@g.batstate-u.edu.ph</span>
            </div>
            <div className="flex items-center text-white">
              <FaPhone className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0 text-white" />
              <span className="text-sm sm:text-base text-white">(043) 425-0139</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center relative">
        {/* Welcome Back and subtitle outside the container */}
        <div className="flex flex-col items-center mb-6 mt-8">
          <div className="w-20 h-1.5 rounded-full bg-[#C1121F] mb-5"></div>
          <h2 className="text-3xl font-extrabold text-[#162C49] tracking-tight mb-1">Welcome Back</h2>
          <p className="text-base text-[#162C49] font-normal">Sign in to access your inventory system</p>
        </div>
        {/* Login Container */}
        <div className="w-full max-w-sm rounded-2xl shadow-lg px-7 py-8 bg-white border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#162C49] mb-2">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent text-base font-normal bg-white placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#162C49] mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent text-base font-normal bg-white placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C1121F] text-white py-3 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow hover:brightness-95"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span className="text-white">Signing in...</span>
                </div>
              ) : (
                <span className="text-white">Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 