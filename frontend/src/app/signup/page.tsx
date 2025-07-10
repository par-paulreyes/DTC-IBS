"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    // Email validation
    const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
    if (!emailPattern.test(email)) {
      setError("Email must be in format: XX-XXXXX@g.batstate-u.edu.ph");
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Left Side - Info with creative overlay */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-cover bg-center relative" style={{backgroundImage: 'url(/dtc-bg.png)'}}>
        {/* No overlay, just a subtle shadow for text readability */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        <div className="relative z-10 flex flex-col justify-center h-full px-8 xl:px-12 max-w-2xl">
          {/* Logo and Title Section - One Line */}
          <div className="flex items-center gap-4 mb-8">
            <Image src="/dtc-logo.jpg" alt="DTC Logo" width={112} height={112} className="w-24 h-24 xl:w-28 xl:h-28 object-cover shadow-2xl border-4 border-white rounded-xl flex-shrink-0" />
            <div className="flex flex-col">
              <h1 className="text-3xl xl:text-4xl font-bold !text-white leading-tight">Digital Transformation Center</h1>
              <h2 className="text-xl xl:text-2xl font-semibold !text-white leading-tight">Inventory Access System</h2>
            </div>
          </div>
          {/* Contact Information */}
          <div className="space-y-5">
            <div className="flex items-start">
              <FaMapMarkerAlt className="w-5 h-5 xl:w-6 xl:h-6 mr-3 mt-1 flex-shrink-0 !text-white" />
              <span className="text-base xl:text-lg !text-white">2F STEER Hub Bldg., Batangas State University, TNEU - Alangilan Campus, Golden Country Homes, Alangilan, Batangas City</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="w-5 h-5 xl:w-6 xl:h-6 mr-3 flex-shrink-0 !text-white" />
              <span className="text-base xl:text-lg !text-white">dtc@g.batstate-u.edu.ph</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="w-5 h-5 xl:w-6 xl:h-6 mr-3 flex-shrink-0 !text-white" />
              <span className="text-base xl:text-lg !text-white">(043) 425-0139</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Sign Up Form */}
      <div className="flex flex-1 flex-col items-center justify-center relative px-4 sm:px-6 lg:px-8">
        {/* Blue accent bar */}
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="w-16 sm:w-20 h-1.5 rounded-full bg-[#162C49] mb-4 sm:mb-5"></div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#162C49] tracking-tight mb-1">Create Account</h2>
          <p className="text-sm sm:text-base text-[#162C49] font-normal text-center">Sign up to access the inventory system</p>
        </div>
        {/* Sign Up Container */}
        <div className="w-full max-w-sm rounded-xl shadow-lg px-4 sm:px-7 py-6 sm:py-8 bg-white border-l-4 border-[#162C49] border border-black">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#162C49] mb-2">Email Address</label>
              <input
                type="email"
                placeholder="e.g., XX-XXXXX@g.batstate-u.edu.ph"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162C49] focus:border-transparent text-base font-normal bg-white placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#162C49] mb-2">Password</label>
              <input
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162C49] focus:border-transparent text-base font-normal bg-white placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[#C1121F] text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#162C49] text-white py-3 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#162C49] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow hover:bg-blue-800 hover:text-white"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span className="text-white">Creating account...</span>
                </div>
              ) : (
                <span className="!text-white">Sign Up</span>
              )}
            </button>
          </form>
          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-[#162C49]">Already have an account? </span>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm font-semibold text-[#162C49] hover:text-blue-800 transition-colors duration-200 underline"
            >
              Sign in.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 