"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const [message, setMessage] = useState("Verifying...");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No verification token provided.");
      setMessage("");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/auth/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setMessage("");
        } else {
          setMessage(data.message || "Email verified! You can now log in.");
        }
      })
      .catch(() => {
        setError("An error occurred during verification.");
        setMessage("");
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Email Verification</h1>
        {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}