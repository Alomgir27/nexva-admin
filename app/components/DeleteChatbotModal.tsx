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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 max-w-md w-full shadow-xl relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 border border-red-500/20 bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider">
              Delete Chatbot
            </h3>
            <p className="text-xs text-[var(--text-text-secondary)] mb-4 font-mono">
              Are you sure you want to delete <strong className="text-[var(--text-text-default)]">{chatbotName}</strong>? This will permanently delete:
            </p>
            <ul className="text-xs text-[var(--text-text-secondary)] mb-4 space-y-1 list-disc list-inside font-mono uppercase tracking-wide">
              <li>All domains and scraped pages</li>
              <li>All conversations and messages</li>
              <li>All support tickets</li>
              <li>All team members</li>
              <li>All documents</li>
            </ul>
            <p className="text-xs font-bold text-red-500 font-mono uppercase tracking-wide border border-red-500/20 bg-red-500/10 p-2">
              ⚠️ This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex space-x-3 mt-8">
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
            className="flex-1 px-4 py-3 bg-red-500 text-white font-bold uppercase tracking-wider font-mono text-xs hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {isDeleting ? "DELETING..." : "DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
}

