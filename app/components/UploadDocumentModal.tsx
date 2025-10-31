"use client";

import { useState } from "react";
import { X, Upload, Loader, AlertCircle, CheckCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/app/config/api";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainId: number;
  onDocumentUploaded: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose, domainId, onDocumentUploaded }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['.pdf', '.docx', '.txt'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setError("Invalid file type. Only PDF, DOCX, and TXT files are allowed.");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_ENDPOINTS.documents.upload(domainId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onDocumentUploaded();
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to upload document");
      }
    } catch (err: any) {
      setError(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Upload Document</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm text-green-500">Document uploaded successfully!</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
              Select File
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              disabled={uploading || success}
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--bg-bg-brand)] file:text-[var(--text-text-onbrand)] file:cursor-pointer hover:file:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50"
            />
            <p className="text-xs text-[var(--text-text-tertiary)] mt-2">
              Supported formats: PDF, DOCX, TXT
            </p>
          </div>

          {file && (
            <div className="p-3 bg-[var(--bg-bg-overlay-l2)] rounded-lg">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-[var(--text-text-secondary)]" />
                <span className="text-sm text-[var(--text-text-default)]">{file.name}</span>
              </div>
              <p className="text-xs text-[var(--text-text-tertiary)] mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading || success}
              className="flex-1 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {uploading && <Loader className="h-4 w-4 animate-spin" />}
              <span>{uploading ? "Uploading..." : "Upload"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

