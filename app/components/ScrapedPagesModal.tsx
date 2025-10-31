"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Search, ChevronLeft, ChevronRight, LayoutGrid, List, Table } from "lucide-react";

interface ScrapedPage {
  id: number;
  url: string;
  title: string | null;
  content_preview: string | null;
  word_count: number;
  last_updated: string;
}

interface ScrapedPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainId: number;
  domainUrl: string;
}

type ViewMode = "table" | "grid" | "list";

export default function ScrapedPagesModal({ isOpen, onClose, domainId, domainUrl }: ScrapedPagesModalProps) {
  const [pages, setPages] = useState<ScrapedPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    if (isOpen) {
      fetchPages();
    }
  }, [isOpen, currentPage]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/domains/${domainId}/pages?page=${currentPage}&per_page=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPages(data.pages);
        setTotal(data.total);
        setTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (page.title && page.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Scraped Pages</h2>
            <p className="text-sm text-[var(--text-text-tertiary)] mt-1">{domainUrl}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-text-tertiary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by URL or title..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
            />
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded transition-colors ${viewMode === "table" ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]" : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"}`}
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]" : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]" : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3 animate-pulse" : "space-y-3 animate-pulse"}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] rounded-lg p-4 h-24"></div>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-text-tertiary)]">No pages found</div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-bg-base-secondary)] sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Words</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[var(--bg-bg-overlay-l1)] transition-colors">
                      <td className="px-4 py-3 text-sm text-[var(--text-text-default)] font-medium max-w-xs truncate">
                        {page.title || "Untitled"}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--bg-bg-brand)] hover:underline flex items-center space-x-1 max-w-sm truncate"
                        >
                          <span className="truncate">{page.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)] whitespace-nowrap">
                        {page.word_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)] max-w-md truncate">
                        {page.content_preview || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] rounded-lg p-4 hover:border-[var(--bg-bg-brand)] transition-colors"
                >
                  <h3 className="font-semibold text-[var(--text-text-default)] mb-2 truncate">
                    {page.title || "Untitled"}
                  </h3>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--bg-bg-brand)] hover:underline flex items-center space-x-1 mb-3"
                  >
                    <span className="truncate">{page.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <div className="flex items-center justify-between text-xs text-[var(--text-text-tertiary)] mb-2">
                    <span>{page.word_count.toLocaleString()} words</span>
                  </div>
                  {page.content_preview && (
                    <p className="text-sm text-[var(--text-text-secondary)] line-clamp-3">
                      {page.content_preview}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] rounded-lg p-4 hover:border-[var(--bg-bg-brand)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--text-text-default)] mb-1 truncate">
                        {page.title || "Untitled"}
                      </h3>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--bg-bg-brand)] hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate">{page.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                    <span className="text-xs text-[var(--text-text-tertiary)] ml-4 whitespace-nowrap">
                      {page.word_count.toLocaleString()} words
                    </span>
                  </div>
                  {page.content_preview && (
                    <p className="text-sm text-[var(--text-text-secondary)] line-clamp-2 mt-2">
                      {page.content_preview}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-border-neutral-l1)] flex items-center justify-between">
          <p className="text-sm text-[var(--text-text-tertiary)]">
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)} of {total} pages
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-[var(--text-text-default)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

