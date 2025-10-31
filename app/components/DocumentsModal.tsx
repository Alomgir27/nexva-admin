"use client";

import { useState, useEffect } from "react";
import { X, FileText, Download, Trash2, Loader, Upload } from "lucide-react";
import { API_ENDPOINTS } from "@/app/config/api";
import UploadDocumentModal from "./UploadDocumentModal";

interface Document {
  id: number;
  filename: string;
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

  const downloadDocument = async (documentId: number, filename: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.documents.download(documentId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to download document");
    }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Documents</h2>
            <p className="text-sm text-[var(--text-text-secondary)]">{domainUrl}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all"
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
            <p className="text-[var(--text-text-secondary)]">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="bg-[var(--bg-bg-base-secondary)] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Words</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Uploaded</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-text-secondary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[var(--bg-bg-base-secondary)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-[var(--text-text-tertiary)]" />
                        <span className="text-sm text-[var(--text-text-default)]">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">
                      {doc.word_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        doc.status === "completed" 
                          ? "bg-green-500/10 text-green-500" 
                          : doc.status === "processing"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => downloadDocument(doc.id, doc.filename)}
                          className="p-2 text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l2)] rounded transition-all"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          disabled={deletingId === doc.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === doc.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-border-neutral-l1)]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--text-text-secondary)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 transition-all"
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

