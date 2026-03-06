"use client";

import type { Tab } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";

const APP_URLS: Record<string, string | undefined> = {
  data_connection: process.env.NEXT_PUBLIC_DATA_CONNECTION_URL,
  pipeline_builder: process.env.NEXT_PUBLIC_PIPELINE_BUILDER_URL,
  ontology: process.env.NEXT_PUBLIC_ONTOLOGY_URL,
  prism: process.env.NEXT_PUBLIC_PRISM_URL,
  lattice: process.env.NEXT_PUBLIC_LATTICE_URL,
  ai_platform: process.env.NEXT_PUBLIC_AI_PLATFORM_URL,
};

export default function AppFrame({ tab }: { tab: Tab | null }) {
  if (!tab) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">◧</div>
          <div className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome to Platform
          </div>
          <div className="text-sm">Select an application from the sidebar or open a recent resource.</div>
          <div className="mt-4 text-xs">
            Press <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)" }}>⌘K</kbd> to search
          </div>
        </div>
      </div>
    );
  }

  const appInfo = APP_REGISTRY[tab.module_type];
  const url = tab.resource_url || APP_URLS[tab.module_type];

  if (url) {
    return (
      <iframe
        src={url}
        className="flex-1 w-full border-0"
        title={tab.title}
        allow="clipboard-write"
      />
    );
  }

  // Placeholder when upstream app isn't running
  return (
    <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
      <div className="text-center">
        <div className="text-4xl mb-4">{appInfo?.icon || "◧"}</div>
        <div className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          {appInfo?.name || tab.title}
        </div>
        <div className="text-sm mb-4">{appInfo?.description}</div>
        <div
          className="inline-block px-4 py-2 rounded-lg text-xs"
          style={{ background: "var(--bg-tertiary)" }}
        >
          Connect upstream service at {APP_URLS[tab.module_type] || "N/A"}
        </div>
      </div>
    </div>
  );
}
