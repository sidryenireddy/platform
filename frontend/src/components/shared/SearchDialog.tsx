"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { SEARCH_TYPE_ICONS } from "@/types/platform";
import type { SearchResult } from "@/types/platform";

// Fallback data when API isn't reachable
const FALLBACK_RESULTS: SearchResult[] = [
  { type: "object", id: "obj-1", title: "Acme Corp", subtitle: "Customer", object_type: "Customer" },
  { type: "object", id: "obj-2", title: "Jane Smith", subtitle: "Contact", object_type: "Contact" },
  { type: "dataset", id: "ds-1", title: "Customer Master", subtitle: "45,230 rows" },
  { type: "pipeline", id: "pipe-1", title: "Customer Enrichment ETL", subtitle: "Runs daily at 2am" },
  { type: "analysis", id: "an-1", title: "Revenue by Region", subtitle: "Prism analysis" },
  { type: "app", id: "app-1", title: "Customer 360 Dashboard", subtitle: "Lattice application" },
  { type: "agent", id: "agent-1", title: "Support Triage Agent", subtitle: "AI Platform agent" },
];

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (result: { type: string; id: string; title: string }) => void;
}

export default function SearchDialog({ open, onClose, onSelect }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(FALLBACK_RESULTS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(FALLBACK_RESULTS);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (!query) {
      setResults(FALLBACK_RESULTS);
      return;
    }
    const timer = setTimeout(() => {
      api.search(query)
        .then((res) => {
          setResults(res.results || []);
          setSelectedIndex(0);
        })
        .catch(() => {
          // Filter fallback locally
          setResults(
            FALLBACK_RESULTS.filter(
              (r) =>
                r.title.toLowerCase().includes(query.toLowerCase()) ||
                (r.subtitle?.toLowerCase().includes(query.toLowerCase()) ?? false)
            )
          );
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  const flatResults = results;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatResults[selectedIndex]) {
      onSelect(flatResults[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [flatResults, selectedIndex, onSelect, onClose]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[600px] rounded-xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span style={{ color: "var(--text-secondary)" }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search everything — objects, datasets, pipelines, apps..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            ESC
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.entries(grouped).map(([type, typeResults]) => (
            <div key={type} className="mb-3">
              <div className="px-3 py-1 text-xs font-semibold uppercase flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <span>{SEARCH_TYPE_ICONS[type] || "•"}</span>
                {type}s ({typeResults.length})
              </div>
              {typeResults.map((r) => {
                flatIndex++;
                const idx = flatIndex;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={r.id}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                    style={{
                      background: isSelected ? "var(--bg-tertiary)" : "transparent",
                      color: "var(--text-primary)",
                    }}
                    onClick={() => onSelect(r)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="text-lg">{SEARCH_TYPE_ICONS[r.type] || "•"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{r.title}</div>
                      {r.subtitle && (
                        <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                          {r.subtitle}
                        </div>
                      )}
                    </div>
                    {r.object_type && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                        {r.object_type}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {results.length === 0 && (
            <div className="py-8 text-center" style={{ color: "var(--text-secondary)" }}>
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t text-xs flex gap-4" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>esc Close</span>
        </div>
      </div>
    </div>
  );
}
