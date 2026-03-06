"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import AppFrame from "./AppFrame";
import SearchDialog from "../shared/SearchDialog";
import NotificationCenter from "../shared/NotificationCenter";
import AIAssist from "../shared/AIAssist";
import type { Tab, ModuleType, Favorite, Notification, NavigationParam } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";
import { api } from "@/lib/api";
import { createIframeListener } from "@/lib/navigation";
import type { PlatformMessage } from "@/lib/navigation";

const USER_ID = "user-1";

export default function BuilderLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [allowedApps, setAllowedApps] = useState<string[]>([]);
  const tabIdCounter = useRef(0);

  // Load initial data
  useEffect(() => {
    api.notifications.list(USER_ID).then(setNotifications).catch(() => {});
    api.favorites.list(USER_ID).then(setFavorites).catch(() => {});
    api.access.getUserAccess(USER_ID).then((r) => setAllowedApps(r.allowed_apps)).catch(() => {});
    api.tabs.list(USER_ID).then((savedTabs) => {
      if (savedTabs.length > 0) {
        setTabs(savedTabs);
        const active = savedTabs.find((t) => t.active) || savedTabs[0];
        setActiveTabId(active.id);
      }
    }).catch(() => {});
  }, []);

  // Poll notifications every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      api.notifications.list(USER_ID).then(setNotifications).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save tabs to API on change (debounced)
  useEffect(() => {
    if (tabs.length === 0 && !activeTabId) return;
    const timer = setTimeout(() => {
      api.tabs.sync(USER_ID, tabs, activeTabId || "").catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [tabs, activeTabId]);

  // Listen for iframe messages (navigation framework)
  useEffect(() => {
    const cleanup = createIframeListener((sourceModule: ModuleType, message: PlatformMessage) => {
      if (message.type === "IFRAME_OBJECT_CLICK") {
        const { objectType, objectId, objectTitle, targetModule } = message.payload as {
          objectType: string;
          objectId: string;
          objectTitle: string;
          targetModule?: ModuleType;
        };
        const navParam: NavigationParam = {
          objectType: objectType as string,
          objectId: objectId as string,
          objectTitle: objectTitle as string,
          sourceModule,
        };
        // Open the target module with the nav param
        const target = (targetModule as ModuleType) || getNavigationTarget(sourceModule, objectType as string);
        if (target) {
          openApp(target, navParam);
        }
      }
    });
    return cleanup;
  }, [tabs]); // eslint-disable-line react-hooks/exhaustive-deps

  const getNavigationTarget = (source: ModuleType, objectType: string): ModuleType | null => {
    // Default navigation: ontology/object_explorer → lattice → prism
    if (source === "ontology" || source === "object_explorer") return "lattice";
    if (source === "lattice") return "prism";
    return null;
  };

  const openApp = useCallback((moduleType: ModuleType, navParam?: NavigationParam) => {
    // If no navParam, check if we already have this app open without a param
    if (!navParam) {
      const existing = tabs.find((t) => t.module_type === moduleType && !t.navParam);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }
    }

    tabIdCounter.current++;
    const appInfo = APP_REGISTRY[moduleType];
    const title = navParam
      ? `${appInfo?.name}: ${navParam.objectTitle}`
      : appInfo?.name || moduleType;

    const newTab: Tab = {
      id: `tab-${Date.now()}-${tabIdCounter.current}`,
      user_id: USER_ID,
      module_type: moduleType,
      title,
      order: tabs.length,
      pinned: false,
      navParam,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  }, [activeTabId]);

  const pinTab = useCallback((id: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }, []);

  const duplicateTab = useCallback((id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    tabIdCounter.current++;
    const newTab: Tab = {
      ...tab,
      id: `tab-${Date.now()}-${tabIdCounter.current}`,
      pinned: false,
      order: tabs.length,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const closeOtherTabs = useCallback((id: string) => {
    setTabs((prev) => prev.filter((t) => t.id === id || t.pinned));
    setActiveTabId(id);
  }, []);

  // Cmd+K handler
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

  const handleSearchSelect = useCallback((result: { type: string; id: string; title: string }) => {
    const moduleMap: Record<string, ModuleType> = {
      object: "object_explorer",
      dataset: "data_connection",
      pipeline: "pipeline_builder",
      analysis: "prism",
      app: "lattice",
      agent: "ai_platform",
    };
    const moduleType = moduleMap[result.type] || "object_explorer";
    openApp(moduleType, {
      objectType: result.type,
      objectId: result.id,
      objectTitle: result.title,
      sourceModule: "object_explorer",
    });
    setSearchOpen(false);
  }, [openApp]);

  const handleNotificationClick = useCallback((notif: Notification) => {
    api.notifications.markRead(notif.id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    if (notif.resource_type) {
      handleSearchSelect({
        type: notif.resource_type,
        id: notif.resource_id || "",
        title: notif.title,
      });
    }
    setNotificationsOpen(false);
  }, [handleSearchSelect]);

  const handleMarkAllRead = useCallback(() => {
    api.notifications.markAllRead(USER_ID).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addFavorite = useCallback((resourceType: string, resourceId: string, title: string) => {
    const existing = favorites.find((f) => f.resource_id === resourceId && f.resource_type === resourceType);
    if (existing) {
      api.favorites.delete(existing.id).catch(() => {});
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
    } else {
      const fav: Partial<Favorite> = {
        id: `fav-${Date.now()}`,
        user_id: USER_ID,
        resource_type: resourceType,
        resource_id: resourceId,
        title,
      };
      api.favorites.create(fav).catch(() => {});
      setFavorites((prev) => [...prev, fav as Favorite]);
    }
  }, [favorites]);

  const removeFavorite = useCallback((id: string) => {
    api.favorites.delete(id).catch(() => {});
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const reorderFavorites = useCallback((dragIndex: number, hoverIndex: number) => {
    setFavorites((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, removed);
      api.favorites.reorder(next.map((f) => f.id)).catch(() => {});
      return next;
    });
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-screen flex flex-col" data-theme="dark">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenApp={openApp}
          favorites={favorites}
          onRemoveFavorite={removeFavorite}
          onReorderFavorites={reorderFavorites}
          allowedApps={allowedApps}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={closeTab}
            onPinTab={pinTab}
            onDuplicateTab={duplicateTab}
            onCloseOtherTabs={closeOtherTabs}
            onSearch={() => setSearchOpen(true)}
            onNotifications={() => setNotificationsOpen(!notificationsOpen)}
            unreadCount={unreadCount}
          />
          <AppFrame tabs={tabs} activeTabId={activeTabId} />
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSearchSelect} />
      <NotificationCenter
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onClickNotification={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
      />
      <AIAssist />
    </div>
  );
}
