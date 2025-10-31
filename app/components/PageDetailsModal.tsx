"use client";

import { X, ExternalLink, Calendar, FileText, Tag } from "lucide-react";

interface PageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: {
    id: number;
    url: string;
    title: string | null;
    content: string | null;
    content_preview: string | null;
    word_count: number;
    tags?: string[];
    last_updated: string;
  } | null;
}

export default function PageDetailsModal({ isOpen, onClose, page }: PageDetailsModalProps) {
  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[var(--text-text-default)]">Page Details</h2>
          <button onClick={onClose} className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto space-y-6">
          <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl p-5">
            <h3 className="text-lg font-semibold text-[var(--text-text-default)] mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Title
            </h3>
            <p className="text-[var(--text-text-default)]">{page.title || "Untitled Page"}</p>
          </div>

          <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl p-5">
            <h3 className="text-lg font-semibold text-[var(--text-text-default)] mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              URL
            </h3>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--bg-bg-brand)] hover:underline break-all flex items-center gap-2"
            >
              {page.url}
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </div>

          {page.tags && page.tags.length > 0 && (
            <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl p-5">
              <h3 className="text-lg font-semibold text-[var(--text-text-default)] mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-[var(--bg-bg-brand)]/10 text-[var(--bg-bg-brand)] text-sm rounded-full border border-[var(--bg-bg-brand)]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl p-5">
              <h3 className="text-sm font-medium text-[var(--text-text-secondary)] mb-2">Word Count</h3>
              <p className="text-2xl font-bold text-[var(--text-text-default)]">
                {page.word_count.toLocaleString()}
              </p>
            </div>

            <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl p-5">
              <h3 className="text-sm font-medium text-[var(--text-text-secondary)] mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Updated
              </h3>
              <p className="text-[var(--text-text-default)]">
                {new Date(page.last_updated).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl p-5">
            <h3 className="text-lg font-semibold text-[var(--text-text-default)] mb-4">Full Content</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-[var(--text-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {page.content || page.content_preview || "No content available"}
              </p>
            </div>
            {page.content && (
              <div className="mt-4 pt-4 border-t border-[var(--border-border-neutral-l1)]">
                <p className="text-xs text-[var(--text-text-tertiary)]">
                  {page.content.length.toLocaleString()} characters total
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-border-neutral-l1)] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

