"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-bg-base-default)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--bg-bg-brand)] opacity-20 blur-2xl rounded-full" />
              <Image
                src="/images/img.png"
                alt="Nexva Logo"
                width={48}
                height={48}
                className="relative z-10 rounded-lg"
                priority
              />
            </div>
            <span className="text-2xl font-semibold text-[var(--text-text-default)]">Nexva</span>
          </div>
          <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--text-text-secondary)]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-[var(--bg-bg-overlay-l1)] backdrop-blur-sm p-8 rounded-2xl border border-[var(--border-border-neutral-l1)]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] placeholder:text-[var(--text-text-tertiary)] focus:outline-none focus:border-[var(--bg-bg-brand)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-text-tertiary)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] placeholder:text-[var(--text-text-tertiary)] focus:outline-none focus:border-[var(--bg-bg-brand)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg font-semibold hover:bg-[var(--bg-bg-brand-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-text-secondary)]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[var(--bg-bg-brand)] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)] transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

