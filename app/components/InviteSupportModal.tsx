"use client";

import { useState } from "react";
import { X, UserPlus, Loader } from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";

interface InviteSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatbotId: number;
  onMemberAdded: () => void;
}

export default function InviteSupportModal({
  isOpen,
  onClose,
  chatbotId,
  onMemberAdded,
}: InviteSupportModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/chatbots/${chatbotId}/support-team`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, name }),
        }
      );

      if (response.ok) {
        setEmail("");
        setName("");
        onMemberAdded();
        onClose();
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to invite member");
      }
    } catch (error) {
      alert("Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] max-w-md w-full mx-4 p-8 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-[var(--text-text-default)]" />
            <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">
              Invite Support Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-bg-overlay-l2)] transition-all text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider font-mono">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="JOHN DOE"
              required
              className="w-full px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)] font-mono text-xs uppercase tracking-wide placeholder:text-[var(--text-text-tertiary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider font-mono">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="JOHN@EXAMPLE.COM"
              required
              className="w-full px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)] font-mono text-xs uppercase tracking-wide placeholder:text-[var(--text-text-tertiary)]"
            />
          </div>

          <p className="text-[10px] text-[var(--text-text-secondary)] font-mono uppercase tracking-wide">
            An invitation email will be sent to this address.
          </p>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-transparent border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] font-bold uppercase tracking-wider font-mono text-xs hover:bg-[var(--bg-bg-overlay-l2)] hover:border-[var(--text-text-tertiary)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono text-xs hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-3 w-3 animate-spin" />
                  <span>SENDING...</span>
                </>
              ) : (
                <span>SEND INVITATION</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

