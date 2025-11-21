"use client";

import { useState, useEffect } from "react";
import { X, FileText, Download, Trash2, Loader, Upload } from "lucide-react";
import { API_ENDPOINTS } from "@/app/config/api";
import UploadDocumentModal from "./UploadDocumentModal";

interface Document {
  id: number;
  filename: string;
  r2_url: string;
  file_type: string;
  file_size: number;
  title: string;
  word_count: number;
  status: string;
  uploaded_at: string;
}

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainId: number;
  domainUrl: string;
}

export default function DocumentsModal({ isOpen, onClose, domainId, domainUrl }: DocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, page]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ENDPOINTS.documents.list(domainId)}?page=${page}&per_page=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        setTotalPages(data.total_pages);
      }
    } catch (error) {
      console.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = (r2Url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = r2Url;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteDocument = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(documentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.documents.delete(documentId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Documents</h2>
            <p className="text-xs text-[var(--text-text-secondary)] font-mono mt-1">{domainUrl}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all text-xs"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={onClose}
              className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-[var(--text-text-tertiary)]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-[var(--text-text-tertiary)] mb-4" />
            <p className="text-[var(--text-text-secondary)] font-mono uppercase tracking-wide text-xs">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 border border-[var(--border-border-neutral-l1)]">
            <table className="w-full">
              <thead className="bg-[var(--bg-bg-base-secondary)] sticky top-0 border-b border-[var(--border-border-neutral-l1)]">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">File</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Size</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Words</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Uploaded</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[var(--bg-bg-base-secondary)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-[var(--text-text-tertiary)]" />
                        <span className="text-xs text-[var(--text-text-default)] font-mono">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-text-secondary)] font-mono">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-text-secondary)] font-mono">
                      {doc.word_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border ${doc.status === "completed"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : doc.status === "processing"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-text-secondary)] font-mono">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => downloadDocument(doc.r2_url, doc.filename)}
                          className="p-1.5 text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l2)] transition-all"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          disabled={deletingId === doc.id}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === doc.id ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-border-neutral-l1)]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 transition-all border border-transparent hover:border-[var(--text-text-tertiary)]"
            >
              Previous
            </button>
            <span className="text-xs text-[var(--text-text-secondary)] font-mono uppercase tracking-wide">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 transition-all border border-transparent hover:border-[var(--text-text-tertiary)]"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showUpload && (
        <UploadDocumentModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          domainId={domainId}
          onDocumentUploaded={() => {
            setShowUpload(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}

