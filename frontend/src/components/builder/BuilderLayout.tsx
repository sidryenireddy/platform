"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import AppFrame from "./AppFrame";
import SearchDialog from "../shared/SearchDialog";
import NotificationCenter from "../shared/NotificationCenter";
import type { Tab, ModuleType } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";

export default function BuilderLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const openApp = useCallback((moduleType: ModuleType) => {
    const existing = tabs.find((t) => t.module_type === moduleType && !t.resource_url);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const appInfo = APP_REGISTRY[moduleType];
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      user_id: "user-1",
      module_type: moduleType,
      title: appInfo?.name || moduleType,
      order: tabs.length,
      pinned: false,
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

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  return (
    <div className="h-screen flex flex-col" data-theme="dark">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenApp={openApp}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={closeTab}
            onSearch={() => setSearchOpen(true)}
            onNotifications={() => setNotificationsOpen(!notificationsOpen)}
            unreadCount={2}
          />
          <AppFrame tab={activeTab} />
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
