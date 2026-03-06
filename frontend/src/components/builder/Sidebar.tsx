"use client";

import { useState } from "react";
import { APP_REGISTRY } from "@/types/platform";
import type { ModuleType, Favorite } from "@/types/platform";

const SIX_APPS: ModuleType[] = [
  "data_connection", "pipeline_builder", "ontology", "prism", "lattice", "ai_platform",
];

const MOCK_FILES = [
  { type: "folder", name: "Datasets", children: ["Customer Master", "Orders 2024", "Product Catalog"] },
  { type: "folder", name: "Pipelines", children: ["Customer Enrichment ETL", "Daily Sync"] },
  { type: "folder", name: "Ontology Types", children: ["Customer", "Order", "Product"] },
  { type: "folder", name: "Analyses", children: ["Revenue by Region", "Customer Segmentation"] },
  { type: "folder", name: "Applications", children: ["Customer 360 Dashboard", "Supply Chain Monitor"] },
  { type: "folder", name: "Agents", children: ["Support Triage Agent", "Data Quality Agent"] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenApp: (moduleType: ModuleType) => void;
  favorites: Favorite[];
  onRemoveFavorite: (id: string) => void;
  onReorderFavorites: (dragIndex: number, hoverIndex: number) => void;
  allowedApps: string[];
}

export default function Sidebar({
  collapsed, onToggle, onOpenApp, favorites, onRemoveFavorite, onReorderFavorites, allowedApps,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("apps");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [aiMessage, setAiMessage] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Filter apps by access control (show all if allowedApps is empty = not loaded yet)
  const visibleApps = SIX_APPS.filter(
    (app) => allowedApps.length === 0 || allowedApps.includes(app)
  );

  if (collapsed) {
    return (
      <div
        className="w-12 h-full flex flex-col items-center py-3 gap-3 border-r shrink-0"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <button onClick={onToggle} className="p-1.5 rounded hover:opacity-80" title="Expand sidebar">☰</button>
        <button onClick={() => { onToggle(); setActiveSection("ai"); }} className="p-1.5 rounded hover:opacity-80" title="AI Assist">✦</button>
        <button onClick={() => { onToggle(); setActiveSection("apps"); }} className="p-1.5 rounded hover:opacity-80" title="Applications">◧</button>
        <button onClick={() => { onToggle(); setActiveSection("favorites"); }} className="p-1.5 rounded hover:opacity-80" title="Favorites">★</button>
        <button onClick={() => { onToggle(); setActiveSection("files"); }} className="p-1.5 rounded hover:opacity-80" title="Files">📁</button>
      </div>
    );
  }

  return (
    <div
      className="w-72 h-full flex flex-col border-r shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="font-semibold text-sm">Platform</span>
        <button onClick={onToggle} className="p-1 rounded hover:opacity-80 text-sm">✕</button>
      </div>

      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { key: "ai", label: "AI Assist" },
          { key: "apps", label: "Apps" },
          { key: "favorites", label: "Favorites" },
          { key: "files", label: "Files" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className="flex-1 py-2 text-xs font-medium border-b-2 transition-colors"
            style={{
              borderColor: activeSection === tab.key ? "var(--accent)" : "transparent",
              color: activeSection === tab.key ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeSection === "ai" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
              <div className="text-center">
                <div className="text-2xl mb-2">✦</div>
                <div className="text-sm">AIP Assist</div>
                <div className="text-xs mt-1">Ask anything about your data</div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Ask AI..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <button className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                →
              </button>
            </div>
          </div>
        )}

        {activeSection === "apps" && (
          <div>
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-secondary)" }}>
              Applications
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleApps.map((key) => {
                const app = APP_REGISTRY[key];
                return (
                  <button
                    key={key}
                    onClick={() => onOpenApp(key)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-xl">{app.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{app.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold uppercase mt-4 mb-2" style={{ color: "var(--text-secondary)" }}>
              Promoted Apps
            </div>
            <div className="space-y-1">
              {["Customer 360 Dashboard", "Supply Chain Monitor"].map((name) => (
                <button
                  key={name}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "favorites" && (
          <div>
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-secondary)" }}>
              Pinned Resources {favorites.length > 0 && `(${favorites.length})`}
            </div>
            {favorites.length === 0 ? (
              <div className="text-xs py-4 text-center" style={{ color: "var(--text-secondary)" }}>
                Star resources to pin them here
              </div>
            ) : (
              <div className="space-y-1">
                {favorites.map((fav, index) => (
                  <div
                    key={fav.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== index) {
                        onReorderFavorites(dragIndex, index);
                      }
                      setDragIndex(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm group cursor-grab"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-xs cursor-grab" style={{ color: "var(--text-secondary)" }}>⠿</span>
                    <span style={{ color: "var(--warning)" }}>★</span>
                    <span className="truncate flex-1">{fav.title}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{fav.resource_type}</span>
                    <button
                      onClick={() => onRemoveFavorite(fav.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      style={{ color: "var(--danger)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "files" && (
          <div>
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-secondary)" }}>
              Files
            </div>
            <div className="space-y-0.5">
              {MOCK_FILES.map((folder) => (
                <div key={folder.name}>
                  <button
                    onClick={() => {
                      const next = new Set(expandedFolders);
                      next.has(folder.name) ? next.delete(folder.name) : next.add(folder.name);
                      setExpandedFolders(next);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-xs">{expandedFolders.has(folder.name) ? "▼" : "▶"}</span>
                    <span>📁</span>
                    <span>{folder.name}</span>
                  </button>
                  {expandedFolders.has(folder.name) && (
                    <div className="ml-6 space-y-0.5">
                      {folder.children.map((child) => (
                        <button
                          key={child}
                          className="w-full text-left px-3 py-1 rounded text-sm transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {child}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
