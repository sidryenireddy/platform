"use client";

import { useState, useEffect, useRef } from "react";
import type { SearchResult } from "@/types/platform";

const MOCK_RESULTS: SearchResult[] = [
  { type: "object", id: "obj-1", title: "Acme Corp", subtitle: "Customer", object_type: "Customer" },
  { type: "object", id: "obj-2", title: "Jane Smith", subtitle: "Contact", object_type: "Contact" },
  { type: "dataset", id: "ds-1", title: "Customer Master", subtitle: "45,230 rows" },
  { type: "pipeline", id: "pipe-1", title: "Customer Enrichment ETL", subtitle: "Runs daily at 2am" },
  { type: "analysis", id: "an-1", title: "Revenue by Region", subtitle: "Prism analysis" },
  { type: "app", id: "app-1", title: "Customer 360 Dashboard", subtitle: "Lattice application" },
  { type: "agent", id: "agent-1", title: "Support Triage Agent", subtitle: "AI Platform agent" },
];

const TYPE_ICONS: Record<string, string> = {
  object: "◆",
  dataset: "▤",
  pipeline: "⟿",
  analysis: "◈",
  app: "◧",
  agent: "◉",
};

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const filtered = query
    ? MOCK_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_RESULTS;

  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[600px] rounded-xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span style={{ color: "var(--text-secondary)" }}>⌘K</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          {Object.entries(grouped).map(([type, results]) => (
            <div key={type} className="mb-3">
              <div className="px-3 py-1 text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>
                {type}s
              </div>
              {results.map((r) => (
                <button
                  key={r.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:opacity-80 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="text-lg">{TYPE_ICONS[r.type] || "•"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{r.title}</div>
                    {r.subtitle && (
                      <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {r.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center" style={{ color: "var(--text-secondary)" }}>
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
