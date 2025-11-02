import { AlertTriangle } from "lucide-react";

interface DeleteChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatbotName: string;
  isDeleting: boolean;
}

export default function DeleteChatbotModal({
  isOpen,
  onClose,
  onConfirm,
  chatbotName,
  isDeleting,
}: DeleteChatbotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text-text-default)] mb-2">
              Delete Chatbot
            </h3>
            <p className="text-sm text-[var(--text-text-secondary)] mb-4">
              Are you sure you want to delete <strong>{chatbotName}</strong>? This will permanently delete:
            </p>
            <ul className="text-sm text-[var(--text-text-secondary)] mb-4 space-y-1 list-disc list-inside">
              <li>All domains and scraped pages</li>
              <li>All conversations and messages</li>
              <li>All support tickets</li>
              <li>All team members</li>
              <li>All documents</li>
            </ul>
            <p className="text-sm font-semibold text-red-500">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-secondary)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l2)] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

