"use client";

import { useState, useRef, useEffect } from "react";
import type { Tab } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";

interface TopBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onPinTab: (id: string) => void;
  onDuplicateTab: (id: string) => void;
  onCloseOtherTabs: (id: string) => void;
  onSearch: () => void;
  onNotifications: () => void;
  unreadCount: number;
}

interface ContextMenu {
  tabId: string;
  x: number;
  y: number;
}

export default function TopBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onPinTab,
  onDuplicateTab,
  onCloseOtherTabs,
  onSearch,
  onNotifications,
  unreadCount,
}: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const appInfo = activeTab ? APP_REGISTRY[activeTab.module_type] : null;

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [contextMenu]);

  // Close profile on click outside
  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [showProfileMenu]);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  };

  const tab = contextMenu ? tabs.find((t) => t.id === contextMenu.tabId) : null;

  return (
    <div
      className="h-10 flex items-center border-b shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 px-4 text-sm min-w-[180px]" style={{ color: "var(--text-secondary)" }}>
        <span>Platform</span>
        {appInfo && (
          <>
            <span className="mx-1">/</span>
            <span style={{ color: "var(--text-primary)" }}>{appInfo.name}</span>
          </>
        )}
        {activeTab?.navParam && (
          <>
            <span className="mx-1">/</span>
            <span style={{ color: "var(--text-primary)" }}>{activeTab.navParam.objectTitle}</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto px-1 min-w-0">
        {tabs.map((t) => {
          const info = APP_REGISTRY[t.module_type];
          const isActive = t.id === activeTabId;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              onContextMenu={(e) => handleContextMenu(e, t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs whitespace-nowrap group shrink-0 max-w-[180px]"
              style={{
                background: isActive ? "var(--bg-primary)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              {t.pinned && <span className="text-[10px]" style={{ color: "var(--accent)" }}>📌</span>}
              <span>{info?.icon || "◧"}</span>
              <span className="truncate">{t.title}</span>
              {!t.pinned && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(t.id);
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => ((e.target as HTMLSpanElement).style.color = "var(--danger)")}
                  onMouseLeave={(e) => ((e.target as HTMLSpanElement).style.color = "var(--text-secondary)")}
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 px-4 shrink-0">
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

        <button onClick={onNotifications} className="relative p-1.5 rounded hover:opacity-80">
          <span>🔔</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white"
              style={{ background: "var(--danger)" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={profileRef}>
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
              {[
                { label: "Account Settings", href: "#" },
                { label: "Preferences", href: "#" },
                { label: "Workspace Editor", href: "/admin/workspaces" },
                { label: "Access Control", href: "/admin/access" },
                { label: "Switch to Workspace Mode", href: "/workspace" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block w-full text-left px-3 py-2 text-sm transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </a>
              ))}
              <div className="border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  className="w-full text-left px-3 py-2 text-sm"
                  style={{ color: "var(--danger)" }}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] rounded-lg border shadow-xl py-1 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => { onPinTab(contextMenu.tabId); setContextMenu(null); }}
          >
            {tab?.pinned ? "Unpin Tab" : "Pin Tab"}
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => { onDuplicateTab(contextMenu.tabId); setContextMenu(null); }}
          >
            Duplicate Tab
          </button>
          <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
          <button
            className="w-full text-left px-3 py-1.5 text-sm"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => { onCloseOtherTabs(contextMenu.tabId); setContextMenu(null); }}
          >
            Close Other Tabs
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm"
            style={{ color: "var(--danger)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => { onCloseTab(contextMenu.tabId); setContextMenu(null); }}
          >
            Close Tab
          </button>
        </div>
      )}
    </div>
  );
}
