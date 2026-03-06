"use client";

import { useState } from "react";
import type { Tab, ModuleType } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";

interface TopBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onSearch: () => void;
  onNotifications: () => void;
  unreadCount: number;
}

export default function TopBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onSearch,
  onNotifications,
  unreadCount,
}: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const appInfo = activeTab ? APP_REGISTRY[activeTab.module_type] : null;

  return (
    <div
      className="h-10 flex items-center border-b shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 px-4 text-sm min-w-[200px]" style={{ color: "var(--text-secondary)" }}>
        <span>Platform</span>
        {appInfo && (
          <>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>{appInfo.name}</span>
          </>
        )}
        {activeTab && activeTab.title !== appInfo?.name && (
          <>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>{activeTab.title}</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto px-2">
        {tabs.map((tab) => {
          const info = APP_REGISTRY[tab.module_type];
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs whitespace-nowrap group"
              style={{
                background: isActive ? "var(--bg-primary)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <span>{info?.icon || "◧"}</span>
              <span>{tab.title}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
              >
                ✕
              </span>
            </button>
          );
        })}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 px-4">
        {/* Search */}
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs border"
          style={{
            background: "var(--bg-tertiary)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Search... <kbd className="text-[10px] opacity-60">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button onClick={onNotifications} className="relative p-1.5 rounded hover:opacity-80">
          <span>🔔</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white"
              style={{ background: "var(--danger)" }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            A
          </button>
          {showProfileMenu && (
            <div
              className="absolute right-0 top-9 w-48 rounded-lg border shadow-xl py-1 z-50"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="text-sm font-medium">Admin User</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>admin@rebelinc.ai</div>
              </div>
              {["Account Settings", "Preferences", "Switch to Workspace Mode"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-3 py-2 text-sm transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {item}
                </button>
              ))}
              <div className="border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  className="w-full text-left px-3 py-2 text-sm"
                  style={{ color: "var(--danger)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
