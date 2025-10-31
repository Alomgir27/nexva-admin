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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Delete Domain</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)] transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[var(--text-text-default)] mb-3">
            Are you sure you want to delete this domain?
          </p>
          <div className="p-3 bg-[var(--bg-bg-base-secondary)] rounded-lg border border-[var(--border-border-neutral-l1)]">
            <p className="text-sm font-mono text-[var(--text-text-secondary)] break-all">
              {domainUrl}
            </p>
          </div>
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">
              ⚠️ This action cannot be undone. All scraped pages and data will be permanently deleted.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isDeleting && <Loader className="h-4 w-4 animate-spin" />}
            <span>{isDeleting ? "Deleting..." : "Delete Domain"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

