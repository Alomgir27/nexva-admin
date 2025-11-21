"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Search, ChevronLeft, ChevronRight, LayoutGrid, List, Table } from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";

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
        `${API_BASE_URL}/api/domains/${domainId}/pages?page=${currentPage}&per_page=10`,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Scraped Pages</h2>
            <p className="text-xs text-[var(--text-text-tertiary)] mt-1 font-mono">{domainUrl}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-text-tertiary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH BY URL OR TITLE..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)] font-mono text-xs uppercase tracking-wide"
            />
          </div>
          <div className="flex items-center gap-px bg-[var(--border-border-neutral-l1)] border border-[var(--border-border-neutral-l1)] p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition-colors ${viewMode === "table" ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]" : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"}`}
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]" : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]" : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto border border-[var(--border-border-neutral-l1)]">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3 animate-pulse p-4" : "space-y-3 animate-pulse p-4"}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] p-4 h-24"></div>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-text-tertiary)] font-mono text-xs uppercase tracking-wide">No pages found</div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-bg-base-secondary)] sticky top-0 border-b border-[var(--border-border-neutral-l1)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Title</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">URL</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Words</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[var(--bg-bg-overlay-l1)] transition-colors">
                      <td className="px-4 py-3 text-xs text-[var(--text-text-default)] font-bold max-w-xs truncate font-mono">
                        {page.title || "UNTITLED"}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--bg-bg-brand)] hover:underline flex items-center space-x-1 max-w-sm truncate font-mono"
                        >
                          <span className="truncate">{page.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-text-secondary)] whitespace-nowrap font-mono">
                        {page.word_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-text-secondary)] max-w-md truncate font-mono">
                        {page.content_preview || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] p-4 hover:border-[var(--bg-bg-brand)] transition-colors group"
                >
                  <h3 className="font-bold text-[var(--text-text-default)] mb-2 truncate text-xs uppercase tracking-wider font-mono">
                    {page.title || "Untitled"}
                  </h3>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--bg-bg-brand)] hover:underline flex items-center space-x-1 mb-3 font-mono"
                  >
                    <span className="truncate">{page.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-text-tertiary)] mb-2 font-mono uppercase tracking-wide">
                    <span>{page.word_count.toLocaleString()} words</span>
                  </div>
                  {page.content_preview && (
                    <p className="text-xs text-[var(--text-text-secondary)] line-clamp-3 font-mono">
                      {page.content_preview}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] p-4 hover:border-[var(--bg-bg-brand)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[var(--text-text-default)] mb-1 truncate text-xs uppercase tracking-wider font-mono">
                        {page.title || "Untitled"}
                      </h3>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--bg-bg-brand)] hover:underline flex items-center space-x-1 font-mono"
                      >
                        <span className="truncate">{page.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                    <span className="text-[10px] text-[var(--text-text-tertiary)] ml-4 whitespace-nowrap font-mono uppercase tracking-wide">
                      {page.word_count.toLocaleString()} words
                    </span>
                  </div>
                  {page.content_preview && (
                    <p className="text-xs text-[var(--text-text-secondary)] line-clamp-2 mt-2 font-mono">
                      {page.content_preview}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-border-neutral-l1)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-text-tertiary)] font-mono uppercase tracking-wide">
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)} of {total} pages
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[var(--text-text-tertiary)] transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-[var(--text-text-default)] font-mono font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[var(--text-text-tertiary)] transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

