"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { User, Mail, Calendar } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.auth.me);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setName(data.name || "");
      }
    } catch (error) {
      console.error("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("Name cannot be empty");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.auth.me, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update profile");
      }
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="h-8 w-32 bg-[var(--bg-bg-overlay-l2)] animate-pulse mb-2" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-tight">Profile</h1>
        <p className="text-[var(--text-text-secondary)] font-mono text-sm">Manage your account settings</p>
      </div>

      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="space-y-8">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider font-mono">
              <User className="h-4 w-4 text-[var(--bg-bg-brand)]" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER YOUR NAME"
              className="w-full px-4 py-3 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)] font-mono text-xs uppercase tracking-wide placeholder:text-[var(--text-text-tertiary)]"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-text-secondary)] mb-2 uppercase tracking-wider font-mono">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              value={userData?.email || ""}
              disabled
              className="w-full px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-secondary)] cursor-not-allowed font-mono text-xs"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-text-secondary)] mb-2 uppercase tracking-wider font-mono">
              <Calendar className="h-4 w-4" />
              Member Since
            </label>
            <input
              type="text"
              value={userData ? new Date(userData.created_at).toLocaleDateString() : ""}
              disabled
              className="w-full px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-secondary)] cursor-not-allowed font-mono text-xs"
            />
          </div>

          {message && (
            <div className={`p-3 border text-xs font-mono uppercase tracking-wide ${message.includes("success")
                ? "bg-green-500/10 border-green-500/20 text-green-500"
                : "bg-red-500/10 border-red-500/20 text-red-500"
              }`}>
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-[var(--border-border-neutral-l1)]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] transition-all font-bold uppercase tracking-wider font-mono text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

