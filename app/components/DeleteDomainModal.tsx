"use client";

import { X, AlertTriangle, Loader } from "lucide-react";

interface DeleteDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  domainUrl: string;
  isDeleting: boolean;
}

export default function DeleteDomainModal({ isOpen, onClose, onConfirm, domainUrl, isDeleting }: DeleteDomainModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 w-full max-w-md relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Delete Domain</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)] transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-[var(--text-text-default)] mb-4 text-sm font-mono">
            Are you sure you want to delete this domain?
          </p>
          <div className="p-4 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] mb-4">
            <p className="text-xs font-mono text-[var(--text-text-secondary)] break-all uppercase tracking-wide">
              {domainUrl}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-500 font-mono uppercase tracking-wide">
              ⚠️ This action cannot be undone. All scraped pages and data will be permanently deleted.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-transparent border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] font-bold uppercase tracking-wider font-mono text-xs hover:bg-[var(--bg-bg-overlay-l2)] hover:border-[var(--text-text-tertiary)] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-500 text-white font-bold uppercase tracking-wider font-mono text-xs hover:bg-red-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isDeleting && <Loader className="h-3 w-3 animate-spin" />}
            <span>{isDeleting ? "DELETING..." : "DELETE DOMAIN"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

