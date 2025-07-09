"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Email validation
    const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
    if (!emailPattern.test(email)) {
      setError("Email must be in format: XX-XXXXX@g.batstate-u.edu.ph (e.g., 22-00869@g.batstate-u.edu.ph)");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Student Email
          </label>
          <input
            type="email"
            placeholder="e.g., 22-00869@g.batstate-u.edu.ph"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-xs text-black mt-1">
            Format: XX-XXXXX@g.batstate-u.edu.ph
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Sign Up</button>
        <div className="mt-4 text-center">
          <span className="text-black">Already have an account?</span>
          <button
            type="button"
            className="ml-2 text-blue-600 hover:underline"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
} 