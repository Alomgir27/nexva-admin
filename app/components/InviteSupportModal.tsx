"use client";

import { useState } from "react";
import { X, UserPlus, Loader } from "lucide-react";

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
        `http://localhost:8000/api/chatbots/${chatbotId}/support-team`,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-[var(--text-text-default)]" />
            <h2 className="text-xl font-semibold text-[var(--text-text-default)]">
              Invite Support Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-bg-overlay-l2)] rounded transition-all"
          >
            <X className="h-5 w-5 text-[var(--text-text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
            />
          </div>

          <p className="text-sm text-[var(--text-text-secondary)]">
            An invitation email will be sent to this address.
          </p>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

