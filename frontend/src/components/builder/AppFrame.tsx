"use client";

import { useRef, useEffect } from "react";
import type { Tab } from "@/types/platform";
import { APP_REGISTRY, APP_ENV_URLS } from "@/types/platform";
import { sendNavParamToIframe } from "@/lib/navigation";

interface AppFrameProps {
  tabs: Tab[];
  activeTabId: string | null;
}

export default function AppFrame({ tabs, activeTabId }: AppFrameProps) {
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());

  // Send nav params when a tab becomes active or when a new tab with navParam is created
  useEffect(() => {
    if (!activeTabId) return;
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab?.navParam) return;

    // Slight delay to ensure iframe is loaded
    const timer = setTimeout(() => {
      const iframe = iframeRefs.current.get(activeTabId);
      if (iframe) {
        sendNavParamToIframe(iframe, tab.navParam!);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTabId, tabs]);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">◧</div>
          <div className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome to Platform
          </div>
          <div className="text-sm mb-2">Select an application from the sidebar to get started.</div>
          <div className="text-xs">
            Press <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)" }}>⌘K</kbd> to search across everything
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const appInfo = APP_REGISTRY[tab.module_type];
        const baseURL = tab.resource_url || APP_ENV_URLS[tab.module_type];

        // Build URL with nav params if present
        let iframeURL = baseURL;
        if (tab.navParam && baseURL) {
          try {
            const url = new URL(baseURL);
            url.searchParams.set("objectType", tab.navParam.objectType);
            url.searchParams.set("objectId", tab.navParam.objectId);
            url.searchParams.set("objectTitle", tab.navParam.objectTitle);
            iframeURL = url.toString();
          } catch {
            iframeURL = baseURL;
          }
        }

        return (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{
              visibility: isActive ? "visible" : "hidden",
              zIndex: isActive ? 1 : 0,
            }}
          >
            {iframeURL ? (
              <iframe
                ref={(el) => {
                  if (el) iframeRefs.current.set(tab.id, el);
                  else iframeRefs.current.delete(tab.id);
                }}
                src={iframeURL}
                className="w-full h-full border-0"
                title={tab.title}
                allow="clipboard-write"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                <div className="text-center max-w-md">
                  <div className="text-4xl mb-4">{appInfo?.icon || "◧"}</div>
                  <div className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    {tab.title}
                  </div>
                  <div className="text-sm mb-4">{appInfo?.description}</div>
                  {tab.navParam && (
                    <div
                      className="inline-block px-4 py-2 rounded-lg text-xs mb-4"
                      style={{ background: "var(--bg-tertiary)" }}
                    >
                      Navigated from {APP_REGISTRY[tab.navParam.sourceModule]?.name}: {tab.navParam.objectType} &quot;{tab.navParam.objectTitle}&quot;
                    </div>
                  )}
                  <div
                    className="px-4 py-2 rounded-lg text-xs"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    Upstream service: {APP_ENV_URLS[tab.module_type] || "not configured"}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
