"use client";

import { useState } from "react";
import type { ModuleType, Workspace } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";
import SearchDialog from "../shared/SearchDialog";

const MOCK_WORKSPACE: Workspace = {
  id: "ws-ops-1",
  name: "Customer Operations",
  description: "Workspace for customer support and operations teams",
  theme: "dark",
  restrict_navigation: true,
  organization_id: "org-1",
  is_promoted: false,
  home_page_config: {
    sections: [
      { type: "search", title: "Search Customers" },
      { type: "object_types", title: "Quick Access", config: { types: ["Customer", "Order", "Ticket"] } },
      { type: "favorites", title: "My Favorites" },
      { type: "links", title: "Quick Links" },
    ],
  },
  menu_bar_config: {
    anchored: ["object_explorer", "lattice", "prism"],
    new_tab: ["ai_platform"],
  },
};

export default function WorkspaceLayout() {
  const [workspace] = useState<Workspace>(MOCK_WORKSPACE);
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNewTabMenu, setShowNewTabMenu] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const anchoredModules = workspace.menu_bar_config?.anchored || [];
  const newTabModules = workspace.menu_bar_config?.new_tab || [];

  return (
    <div className="h-screen flex flex-col" data-theme={workspace.theme}>
      {/* Menu Bar */}
      <div
        className="h-11 flex items-center px-4 border-b shrink-0"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 mr-6">
          <span className="font-semibold text-sm">{workspace.name}</span>
        </div>

        {/* Anchored module tabs */}
        <div className="flex items-center gap-1">
          {anchoredModules.map((mod) => {
            const info = APP_REGISTRY[mod];
            return (
              <button
                key={mod}
                onClick={() => setActiveModule(mod)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: activeModule === mod ? "var(--bg-tertiary)" : "transparent",
                  color: activeModule === mod ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <span>{info?.icon}</span>
                <span>{info?.name}</span>
              </button>
            );
          })}
        </div>

        {/* New tab dropdown */}
        {newTabModules.length > 0 && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowNewTabMenu(!showNewTabMenu)}
              className="px-2 py-1 rounded text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              + More
            </button>
            {showNewTabMenu && (
              <div
                className="absolute left-0 top-8 w-48 rounded-lg border shadow-xl py-1 z-50"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
              >
                {newTabModules.map((mod) => {
                  const info = APP_REGISTRY[mod];
                  return (
                    <button
                      key={mod}
                      onClick={() => {
                        setActiveModule(mod);
                        setShowNewTabMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span>{info?.icon}</span>
                      <span>{info?.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs border mr-2"
          style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          Search... <kbd className="text-[10px] opacity-60">⌘K</kbd>
        </button>

        {/* Workspace switcher */}
        <button
          className="px-3 py-1 rounded text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          Switch Workspace
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {activeModule ? (
          <div className="flex-1 flex items-center justify-center h-full" style={{ color: "var(--text-secondary)" }}>
            <div className="text-center">
              <div className="text-4xl mb-4">{APP_REGISTRY[activeModule]?.icon}</div>
              <div className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                {APP_REGISTRY[activeModule]?.name}
              </div>
              <div className="text-sm">{APP_REGISTRY[activeModule]?.description}</div>
            </div>
          </div>
        ) : (
          /* Home page */
          <div className="max-w-4xl mx-auto py-8 px-6">
            <h1 className="text-2xl font-bold mb-1">{workspace.name}</h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>{workspace.description}</p>

            {workspace.home_page_config?.sections.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-sm font-semibold uppercase mb-3" style={{ color: "var(--text-secondary)" }}>
                  {section.title}
                </h2>
                {section.type === "search" && (
                  <input
                    type="text"
                    placeholder="Search customers, orders, tickets..."
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={() => setSearchOpen(true)}
                  />
                )}
                {section.type === "object_types" && (
                  <div className="grid grid-cols-3 gap-3">
                    {["Customer", "Order", "Ticket"].map((type) => (
                      <button
                        key={type}
                        className="p-4 rounded-lg border text-left transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div className="font-medium text-sm">{type}</div>
                        <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          Browse all {type.toLowerCase()}s
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {section.type === "favorites" && (
                  <div className="space-y-2">
                    {["Acme Corp", "Pending Escalations", "Q4 Revenue Analysis"].map((fav) => (
                      <button
                        key={fav}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ color: "var(--warning)" }}>★</span>
                        {fav}
                      </button>
                    ))}
                  </div>
                )}
                {section.type === "links" && (
                  <div className="grid grid-cols-2 gap-2">
                    {["View All Customers", "Create New Ticket", "Open Reports", "Team Dashboard"].map((link) => (
                      <button
                        key={link}
                        className="px-4 py-3 rounded-lg border text-sm text-left transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AIP Assist floating button */}
      <div className="fixed bottom-6 right-6 z-30">
        {aiAssistOpen && (
          <div
            className="absolute bottom-14 right-0 w-[350px] h-[450px] rounded-xl border shadow-2xl flex flex-col overflow-hidden"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold text-sm">AIP Assist</span>
              <button onClick={() => setAiAssistOpen(false)} className="text-sm hover:opacity-80">✕</button>
            </div>
            <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
              <div className="text-center px-6">
                <div className="text-2xl mb-2">✦</div>
                <div className="text-sm">Ask anything about your workspace</div>
              </div>
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
              <input
                type="text"
                placeholder="Ask AI..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <button
                className="px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                →
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setAiAssistOpen(!aiAssistOpen)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg transition-transform hover:scale-105"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          ✦
        </button>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
