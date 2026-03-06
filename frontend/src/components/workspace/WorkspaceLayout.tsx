"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ModuleType, Workspace, NavigationParam } from "@/types/platform";
import { APP_REGISTRY, APP_ENV_URLS } from "@/types/platform";
import SearchDialog from "../shared/SearchDialog";
import NotificationCenter from "../shared/NotificationCenter";
import AIAssist from "../shared/AIAssist";
import type { Notification } from "@/types/platform";
import { api } from "@/lib/api";
import { createIframeListener, sendNavParamToIframe } from "@/lib/navigation";
import type { PlatformMessage } from "@/lib/navigation";

const USER_ID = "user-1";

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

interface WorkspaceTab {
  id: string;
  moduleType: ModuleType;
  title: string;
  navParam?: NavigationParam;
}

export default function WorkspaceLayout() {
  const [workspace] = useState<Workspace>(MOCK_WORKSPACE);
  const [wsTabs, setWsTabs] = useState<WorkspaceTab[]>([]);
  const [activeWsTabId, setActiveWsTabId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNewTabMenu, setShowNewTabMenu] = useState(false);
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());

  const anchoredModules = workspace.menu_bar_config?.anchored || [];
  const newTabModules = workspace.menu_bar_config?.new_tab || [];

  useEffect(() => {
    api.notifications.list(USER_ID).then(setNotifications).catch(() => {});
    const interval = setInterval(() => {
      api.notifications.list(USER_ID).then(setNotifications).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Navigation framework: listen for iframe messages
  useEffect(() => {
    const cleanup = createIframeListener((sourceModule: ModuleType, message: PlatformMessage) => {
      if (message.type === "IFRAME_OBJECT_CLICK") {
        const { objectType, objectId, objectTitle, targetModule } = message.payload as {
          objectType: string; objectId: string; objectTitle: string; targetModule?: ModuleType;
        };
        const navParam: NavigationParam = {
          objectType: objectType as string,
          objectId: objectId as string,
          objectTitle: objectTitle as string,
          sourceModule,
        };
        const target = (targetModule as ModuleType) ||
          (sourceModule === "object_explorer" ? "lattice" : sourceModule === "lattice" ? "prism" : null);
        if (target) openModule(target, navParam);
      }
    });
    return cleanup;
  }, [wsTabs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send nav params to newly active iframe
  useEffect(() => {
    if (!activeWsTabId) return;
    const tab = wsTabs.find((t) => t.id === activeWsTabId);
    if (!tab?.navParam) return;
    const timer = setTimeout(() => {
      const iframe = iframeRefs.current.get(activeWsTabId);
      if (iframe) sendNavParamToIframe(iframe, tab.navParam!);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeWsTabId, wsTabs]);

  const openModule = useCallback((moduleType: ModuleType, navParam?: NavigationParam) => {
    if (!navParam) {
      const existing = wsTabs.find((t) => t.moduleType === moduleType && !t.navParam);
      if (existing) {
        setActiveWsTabId(existing.id);
        return;
      }
    }
    const title = navParam
      ? `${APP_REGISTRY[moduleType]?.name}: ${navParam.objectTitle}`
      : APP_REGISTRY[moduleType]?.name || moduleType;
    const newTab: WorkspaceTab = {
      id: `wst-${Date.now()}`,
      moduleType,
      title,
      navParam,
    };
    setWsTabs((prev) => [...prev, newTab]);
    setActiveWsTabId(newTab.id);
  }, [wsTabs]);

  const closeWsTab = useCallback((id: string) => {
    setWsTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeWsTabId === id) {
        setActiveWsTabId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  }, [activeWsTabId]);

  const handleSearchSelect = useCallback((result: { type: string; id: string; title: string }) => {
    const moduleMap: Record<string, ModuleType> = {
      object: "object_explorer", dataset: "data_connection", pipeline: "pipeline_builder",
      analysis: "prism", app: "lattice", agent: "ai_platform",
    };
    openModule(moduleMap[result.type] || "object_explorer", {
      objectType: result.type,
      objectId: result.id,
      objectTitle: result.title,
      sourceModule: "object_explorer",
    });
    setSearchOpen(false);
  }, [openModule]);

  const handleNotificationClick = useCallback((notif: Notification) => {
    api.notifications.markRead(notif.id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    if (notif.resource_type) {
      handleSearchSelect({ type: notif.resource_type, id: notif.resource_id || "", title: notif.title });
    }
    setNotificationsOpen(false);
  }, [handleSearchSelect]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeWsTab = wsTabs.find((t) => t.id === activeWsTabId);
  const showHome = !activeWsTabId && wsTabs.length === 0;

  return (
    <div className="h-screen flex flex-col" data-theme={workspace.theme}>
      {/* Menu Bar */}
      <div className="h-11 flex items-center px-4 border-b shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mr-4 shrink-0">
          <span className="font-semibold text-sm">{workspace.name}</span>
        </div>

        {/* Anchored modules */}
        <div className="flex items-center gap-0.5">
          {anchoredModules.map((mod) => {
            const info = APP_REGISTRY[mod];
            const isActive = wsTabs.some((t) => t.moduleType === mod && t.id === activeWsTabId && !t.navParam);
            return (
              <button
                key={mod}
                onClick={() => openModule(mod)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: isActive ? "var(--bg-tertiary)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <span>{info?.icon}</span>
                <span>{info?.name}</span>
              </button>
            );
          })}
        </div>

        {/* Open tab labels for nav-param tabs */}
        {wsTabs.filter((t) => t.navParam).map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs ml-1 group cursor-pointer"
            style={{
              background: t.id === activeWsTabId ? "var(--bg-tertiary)" : "transparent",
              color: t.id === activeWsTabId ? "var(--text-primary)" : "var(--text-secondary)",
            }}
            onClick={() => setActiveWsTabId(t.id)}
          >
            <span>{APP_REGISTRY[t.moduleType]?.icon}</span>
            <span className="truncate max-w-[120px]">{t.title}</span>
            <span
              onClick={(e) => { e.stopPropagation(); closeWsTab(t.id); }}
              className="opacity-0 group-hover:opacity-100 ml-1"
              style={{ color: "var(--danger)" }}
            >✕</span>
          </div>
        ))}

        {/* New tab dropdown */}
        {newTabModules.length > 0 && (
          <div className="relative ml-1">
            <button onClick={() => setShowNewTabMenu(!showNewTabMenu)} className="px-2 py-1 rounded text-xs" style={{ color: "var(--text-secondary)" }}>
              + More
            </button>
            {showNewTabMenu && (
              <div className="absolute left-0 top-8 w-48 rounded-lg border shadow-xl py-1 z-50" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                {newTabModules.map((mod) => {
                  const info = APP_REGISTRY[mod];
                  return (
                    <button
                      key={mod}
                      onClick={() => { openModule(mod); setShowNewTabMenu(false); }}
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

        {/* Home button */}
        <button
          onClick={() => { setActiveWsTabId(null); setWsTabs([]); }}
          className="px-2 py-1 rounded text-xs mr-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Home
        </button>

        <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs border mr-2" style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          Search... <kbd className="text-[10px] opacity-60">⌘K</kbd>
        </button>

        <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-1.5 rounded hover:opacity-80 mr-2">
          <span>🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: "var(--danger)" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {!workspace.restrict_navigation && (
          <a href="/" className="px-3 py-1 rounded text-xs" style={{ color: "var(--text-secondary)" }}>
            Builder Mode
          </a>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        {showHome && (
          <div className="h-full overflow-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
              <h1 className="text-2xl font-bold mb-1">{workspace.name}</h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>{workspace.description}</p>
              {workspace.home_page_config?.sections.map((section, i) => (
                <div key={i} className="mb-8">
                  <h2 className="text-sm font-semibold uppercase mb-3" style={{ color: "var(--text-secondary)" }}>{section.title}</h2>
                  {section.type === "search" && (
                    <input type="text" placeholder="Search customers, orders, tickets..." className="w-full px-4 py-3 rounded-lg border text-sm outline-none" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }} onFocus={() => setSearchOpen(true)} />
                  )}
                  {section.type === "object_types" && (
                    <div className="grid grid-cols-3 gap-3">
                      {["Customer", "Order", "Ticket"].map((type) => (
                        <button key={type} onClick={() => openModule("object_explorer", { objectType: type, objectId: "", objectTitle: type, sourceModule: "object_explorer" })} className="p-4 rounded-lg border text-left transition-colors" style={{ borderColor: "var(--border)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <div className="font-medium text-sm">{type}</div>
                          <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Browse all {type.toLowerCase()}s</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {section.type === "favorites" && (
                    <div className="space-y-2">
                      {["Acme Corp", "Pending Escalations", "Q4 Revenue Analysis"].map((fav) => (
                        <button key={fav} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <span style={{ color: "var(--warning)" }}>★</span>{fav}
                        </button>
                      ))}
                    </div>
                  )}
                  {section.type === "links" && (
                    <div className="grid grid-cols-2 gap-2">
                      {["View All Customers", "Create New Ticket", "Open Reports", "Team Dashboard"].map((link) => (
                        <button key={link} className="px-4 py-3 rounded-lg border text-sm text-left transition-colors" style={{ borderColor: "var(--border)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          {link}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Iframe tabs - all rendered, only active visible */}
        {wsTabs.map((t) => {
          const isActive = t.id === activeWsTabId;
          const baseURL = APP_ENV_URLS[t.moduleType];
          let iframeURL = baseURL;
          if (t.navParam && baseURL) {
            try {
              const url = new URL(baseURL);
              url.searchParams.set("objectType", t.navParam.objectType);
              url.searchParams.set("objectId", t.navParam.objectId);
              url.searchParams.set("objectTitle", t.navParam.objectTitle);
              iframeURL = url.toString();
            } catch { iframeURL = baseURL; }
          }

          return (
            <div key={t.id} className="absolute inset-0" style={{ visibility: isActive ? "visible" : "hidden", zIndex: isActive ? 1 : 0 }}>
              {iframeURL ? (
                <iframe
                  ref={(el) => { if (el) iframeRefs.current.set(t.id, el); else iframeRefs.current.delete(t.id); }}
                  src={iframeURL}
                  className="w-full h-full border-0"
                  title={t.title}
                  allow="clipboard-write"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">{APP_REGISTRY[t.moduleType]?.icon}</div>
                    <div className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>{t.title}</div>
                    <div className="text-sm mb-4">{APP_REGISTRY[t.moduleType]?.description}</div>
                    {t.navParam && (
                      <div className="px-4 py-2 rounded-lg text-xs mb-2" style={{ background: "var(--bg-tertiary)" }}>
                        Navigated: {t.navParam.objectType} &quot;{t.navParam.objectTitle}&quot; from {APP_REGISTRY[t.navParam.sourceModule]?.name}
                      </div>
                    )}
                    <div className="px-4 py-2 rounded-lg text-xs" style={{ background: "var(--bg-tertiary)" }}>
                      Upstream: {APP_ENV_URLS[t.moduleType]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AIAssist />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSearchSelect} />
      <NotificationCenter
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onClickNotification={handleNotificationClick}
        onMarkAllRead={() => {
          api.notifications.markAllRead(USER_ID).catch(() => {});
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />
    </div>
  );
}
