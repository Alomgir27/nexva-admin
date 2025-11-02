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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="h-8 w-32 bg-[var(--bg-bg-overlay-l2)] rounded animate-pulse mb-2" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-text-default)]">Profile</h1>
        <p className="text-sm text-[var(--text-text-secondary)] mt-1">Manage your account settings</p>
      </div>

      <div className="bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-text-default)] mb-2">
              <User className="h-4 w-4" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:ring-2 focus:ring-[var(--bg-bg-brand)]"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-text-secondary)] mb-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              value={userData?.email || ""}
              disabled
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-secondary)] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-text-secondary)] mb-2">
              <Calendar className="h-4 w-4" />
              Member Since
            </label>
            <input
              type="text"
              value={userData ? new Date(userData.created_at).toLocaleDateString() : ""}
              disabled
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-secondary)] cursor-not-allowed"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

