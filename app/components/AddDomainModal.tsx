"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Loader } from "lucide-react";
import { API_ENDPOINTS } from "@/app/config/api";

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatbotId: number;
  onDomainAdded: () => void;
}

export default function AddDomainModal({ isOpen, onClose, chatbotId, onDomainAdded }: AddDomainModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submit

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setError("");
      setShowConfirmation(false);
      setLoading(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.domains, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatbot_id: chatbotId, url }),
      });

      if (response.ok) {
        onClose();
        onDomainAdded();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to add domain");
        setLoading(false);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(`Failed to connect: ${err?.message || 'Unknown error'}`);
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">
            {showConfirmation ? "Confirm Scraping" : "Add Domain"}
          </h2>
          <button onClick={onClose} className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-red-500 font-mono uppercase tracking-wide">{error}</p>
          </div>
        )}

        {!showConfirmation ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider font-mono">
                Domain URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="HTTPS://EXAMPLE.COM"
                className="w-full px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)] font-mono text-sm"
              />
              <p className="text-[10px] text-[var(--text-text-tertiary)] mt-2 font-mono uppercase tracking-wide">
                This will automatically start scraping the domain and all its pages.
              </p>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all"
            >
              Continue
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)]">
              <p className="text-sm text-[var(--text-text-default)] mb-2 font-mono">
                Start scraping <span className="text-[var(--bg-bg-brand)]">{url}</span>?
              </p>
              <p className="text-[10px] text-[var(--text-text-tertiary)] font-mono uppercase tracking-wide">
                Scraping will start in the background. The modal will close immediately and you can continue working.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-overlay-l3)] transition-all border border-transparent hover:border-[var(--text-text-tertiary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                <span>{loading ? "Adding..." : "Start Scraping"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

