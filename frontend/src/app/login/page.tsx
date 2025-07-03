"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Updated email validation for format: XX-XXXXX@g.batstate-u.edu.ph
    const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
    
    if (!emailPattern.test(email)) {
      setError("Email must be in format: XX-XXXXX@g.batstate-u.edu.ph (e.g., 22-00869@g.batstate-u.edu.ph)");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
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
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
} 