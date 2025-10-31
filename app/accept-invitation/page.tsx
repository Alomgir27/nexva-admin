"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";
import Link from "next/link";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/invitation/${token}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Invalid invitation");
      }

      const data = await response.json();
      setInvitationDetails(data);
    } catch (err: any) {
      setError(err.message || "Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationDetails.user_exists) {
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setAccepting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/support/accept-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: invitationDetails.user_exists ? null : password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to accept invitation");
      }

      const data = await response.json();
      
      localStorage.setItem("token", data.token);
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/dashboard/support");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
          <p className="text-gray-600 mb-4">
            You've successfully joined the support team for {invitationDetails?.chatbot_name}.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Team Invitation</h1>
          <p className="text-gray-600">
            You've been invited to join the support team for
          </p>
          <p className="text-xl font-semibold text-indigo-600 mt-1">
            {invitationDetails?.chatbot_name}
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Email:</span> {invitationDetails?.email}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-semibold">Name:</span> {invitationDetails?.name}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleAccept}>
          {!invitationDetails?.user_exists && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                You don't have an account yet. Create a password to get started.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </>
          )}

          {invitationDetails?.user_exists && (
            <p className="text-sm text-gray-600 mb-6">
              Your account already exists. Click accept to join the support team.
            </p>
          )}

          <button
            type="submit"
            disabled={accepting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {accepting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          By accepting, you agree to Nexva's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

