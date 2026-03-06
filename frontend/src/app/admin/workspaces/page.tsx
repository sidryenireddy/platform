"use client";

import { useState, useCallback } from "react";
import type { Workspace, HomePageSection, ModuleType, SectionType } from "@/types/platform";
import { APP_REGISTRY } from "@/types/platform";
import { api } from "@/lib/api";

const SIX_APPS: ModuleType[] = [
  "data_connection", "pipeline_builder", "ontology", "prism", "lattice", "ai_platform",
];

const SECTION_TYPES: { type: SectionType; label: string; icon: string }[] = [
  { type: "search", label: "Search Bar", icon: "🔍" },
  { type: "object_types", label: "Object Types", icon: "◆" },
  { type: "favorites", label: "Favorites", icon: "★" },
  { type: "links", label: "Quick Links", icon: "🔗" },
  { type: "custom_text", label: "Custom Text", icon: "📝" },
  { type: "metrics", label: "Metrics Cards", icon: "📊" },
  { type: "recent", label: "Recent Items", icon: "🕐" },
  { type: "promoted_apps", label: "Promoted Apps", icon: "◧" },
];

const BLANK_WORKSPACE: Workspace = {
  id: "",
  name: "",
  description: "",
  theme: "dark",
  restrict_navigation: false,
  organization_id: "org-1",
  is_promoted: false,
  home_page_config: { sections: [] },
  menu_bar_config: { anchored: [], new_tab: [] },
  allowed_roles: ["admin", "builder", "operator"],
};

export default function WorkspaceEditorPage() {
  const [workspace, setWorkspace] = useState<Workspace>({ ...BLANK_WORKSPACE, id: `ws-${Date.now()}` });
  const [savedWorkspaces, setSavedWorkspaces] = useState<Workspace[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "home" | "menubar" | "permissions">("general");

  const sections = workspace.home_page_config?.sections || [];
  const anchored = workspace.menu_bar_config?.anchored || [];
  const newTab = workspace.menu_bar_config?.new_tab || [];

  const updateSections = useCallback((s: HomePageSection[]) => {
    setWorkspace((prev) => ({
      ...prev,
      home_page_config: { sections: s },
    }));
  }, []);

  const addSection = (type: SectionType) => {
    const label = SECTION_TYPES.find((s) => s.type === type)?.label || type;
    updateSections([...sections, { type, title: label, column: sections.length % 2 }]);
  };

  const removeSection = (index: number) => {
    updateSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (from: number, to: number) => {
    const next = [...sections];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    updateSections(next);
  };

  const updateSectionTitle = (index: number, title: string) => {
    updateSections(sections.map((s, i) => (i === index ? { ...s, title } : s)));
  };

  const updateSectionColumn = (index: number, column: number) => {
    updateSections(sections.map((s, i) => (i === index ? { ...s, column } : s)));
  };

  const toggleAnchored = (mod: ModuleType) => {
    const next = anchored.includes(mod)
      ? anchored.filter((m) => m !== mod)
      : [...anchored, mod];
    setWorkspace((prev) => ({
      ...prev,
      menu_bar_config: { anchored: next, new_tab: newTab.filter((m) => !next.includes(m)) },
    }));
  };

  const toggleNewTab = (mod: ModuleType) => {
    const next = newTab.includes(mod)
      ? newTab.filter((m) => m !== mod)
      : [...newTab, mod];
    setWorkspace((prev) => ({
      ...prev,
      menu_bar_config: { anchored: anchored.filter((m) => !next.includes(m)), new_tab: next },
    }));
  };

  const toggleRole = (role: string) => {
    const roles = workspace.allowed_roles || [];
    const next = roles.includes(role)
      ? roles.filter((r) => r !== role)
      : [...roles, role];
    setWorkspace((prev) => ({ ...prev, allowed_roles: next }));
  };

  const saveWorkspace = async () => {
    setSaving(true);
    try {
      await api.workspaces.create(workspace);
      setSavedWorkspaces((prev) => [...prev, workspace]);
      setWorkspace({ ...BLANK_WORKSPACE, id: `ws-${Date.now()}` });
    } catch {
      // may already exist, try update
      try {
        await api.workspaces.update(workspace.id, workspace);
      } catch { /* ignore */ }
    } finally {
      setSaving(false);
    }
  };

  if (preview) {
    return (
      <div className="h-screen flex flex-col" data-theme={workspace.theme}>
        <div className="h-10 flex items-center px-4 border-b" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <button onClick={() => setPreview(false)} className="text-xs mr-4 px-3 py-1 rounded" style={{ background: "var(--accent)", color: "#fff" }}>
            Exit Preview
          </button>
          <span className="font-semibold text-sm">{workspace.name || "Untitled Workspace"}</span>
          <div className="flex items-center gap-1 ml-4">
            {anchored.map((mod) => (
              <span key={mod} className="px-2 py-1 text-xs rounded" style={{ background: "var(--bg-tertiary)" }}>
                {APP_REGISTRY[mod]?.icon} {APP_REGISTRY[mod]?.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8" style={{ background: "var(--bg-primary)" }}>
          <h1 className="text-2xl font-bold mb-1">{workspace.name || "Untitled Workspace"}</h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>{workspace.description}</p>
          <div className="grid grid-cols-2 gap-6">
            {sections.map((section, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: "var(--border)",
                  gridColumn: sections.length === 1 ? "span 2" : undefined,
                }}
              >
                <h3 className="text-sm font-semibold uppercase mb-3" style={{ color: "var(--text-secondary)" }}>{section.title}</h3>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  [{SECTION_TYPES.find((s) => s.type === section.type)?.icon}] {section.type} section content
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" data-theme="dark">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-6 border-b shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>← Back to Platform</a>
          <span className="font-semibold">Workspace Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(true)} className="px-3 py-1.5 text-xs rounded-lg border" style={{ borderColor: "var(--border)" }}>
            Preview
          </button>
          <button
            onClick={saveWorkspace}
            disabled={saving || !workspace.name}
            className="px-4 py-1.5 text-xs rounded-lg font-medium"
            style={{ background: "var(--accent)", color: "#fff", opacity: saving || !workspace.name ? 0.5 : 1 }}
          >
            {saving ? "Saving..." : "Save Workspace"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tab navigation */}
        <div className="w-48 border-r p-4 space-y-1 shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          {([
            { key: "general", label: "General" },
            { key: "home", label: "Home Page" },
            { key: "menubar", label: "Menu Bar" },
            { key: "permissions", label: "Permissions" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: activeTab === tab.key ? "var(--bg-tertiary)" : "transparent",
                color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && (
            <div className="max-w-xl space-y-5">
              <h2 className="text-lg font-semibold">General Settings</h2>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Workspace Name</label>
                <input
                  type="text"
                  value={workspace.name}
                  onChange={(e) => setWorkspace((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Customer Operations"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
                <textarea
                  value={workspace.description}
                  onChange={(e) => setWorkspace((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What this workspace is for"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Logo URL</label>
                <input
                  type="text"
                  value={workspace.logo_url || ""}
                  onChange={(e) => setWorkspace((p) => ({ ...p, logo_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Theme</label>
                <div className="flex gap-2">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setWorkspace((p) => ({ ...p, theme: t }))}
                      className="px-4 py-2 rounded-lg text-sm border capitalize"
                      style={{
                        borderColor: workspace.theme === t ? "var(--accent)" : "var(--border)",
                        background: workspace.theme === t ? "var(--accent)" : "transparent",
                        color: workspace.theme === t ? "#fff" : "var(--text-primary)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={workspace.restrict_navigation}
                  onChange={(e) => setWorkspace((p) => ({ ...p, restrict_navigation: e.target.checked }))}
                  id="restrict-nav"
                  className="rounded"
                />
                <label htmlFor="restrict-nav" className="text-sm">
                  Restrict navigation (users cannot leave this workspace)
                </label>
              </div>
            </div>
          )}

          {activeTab === "home" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold mb-4">Home Page Layout</h2>
              <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                Add sections to the workspace home page. Drag to reorder.
              </p>

              {/* Section palette */}
              <div className="flex flex-wrap gap-2 mb-6">
                {SECTION_TYPES.map((st) => (
                  <button
                    key={st.type}
                    onClick={() => addSection(st.type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>{st.icon}</span>
                    <span>+ {st.label}</span>
                  </button>
                ))}
              </div>

              {/* Section list */}
              <div className="space-y-2">
                {sections.map((section, i) => {
                  const st = SECTION_TYPES.find((s) => s.type === section.type);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => i > 0 && moveSection(i, i - 1)}
                          disabled={i === 0}
                          className="text-[10px] px-1"
                          style={{ opacity: i === 0 ? 0.3 : 1 }}
                        >▲</button>
                        <button
                          onClick={() => i < sections.length - 1 && moveSection(i, i + 1)}
                          disabled={i === sections.length - 1}
                          className="text-[10px] px-1"
                          style={{ opacity: i === sections.length - 1 ? 0.3 : 1 }}
                        >▼</button>
                      </div>
                      <span className="text-lg">{st?.icon}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(i, e.target.value)}
                          className="bg-transparent outline-none text-sm font-medium w-full"
                          style={{ color: "var(--text-primary)" }}
                        />
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{section.type}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span style={{ color: "var(--text-secondary)" }}>Col:</span>
                        {[0, 1].map((col) => (
                          <button
                            key={col}
                            onClick={() => updateSectionColumn(i, col)}
                            className="w-6 h-6 rounded text-center"
                            style={{
                              background: (section.column || 0) === col ? "var(--accent)" : "var(--bg-tertiary)",
                              color: (section.column || 0) === col ? "#fff" : "var(--text-secondary)",
                            }}
                          >
                            {col + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeSection(i)}
                        className="text-sm px-1"
                        style={{ color: "var(--danger)" }}
                      >✕</button>
                    </div>
                  );
                })}
                {sections.length === 0 && (
                  <div className="py-8 text-center text-sm rounded-lg border border-dashed" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    Click a section type above to add it to the home page
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "menubar" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold mb-4">Menu Bar Configuration</h2>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Anchored Modules (always visible as tabs)</h3>
                <div className="space-y-1">
                  {SIX_APPS.map((mod) => {
                    const app = APP_REGISTRY[mod];
                    const isAnchored = anchored.includes(mod);
                    const isNewTab = newTab.includes(mod);
                    return (
                      <div
                        key={mod}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
                      >
                        <span className="text-lg">{app.icon}</span>
                        <span className="flex-1 text-sm">{app.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAnchored(mod)}
                            className="px-3 py-1 text-xs rounded"
                            style={{
                              background: isAnchored ? "var(--accent)" : "var(--bg-tertiary)",
                              color: isAnchored ? "#fff" : "var(--text-secondary)",
                            }}
                          >
                            Anchored
                          </button>
                          <button
                            onClick={() => toggleNewTab(mod)}
                            className="px-3 py-1 text-xs rounded"
                            style={{
                              background: isNewTab ? "var(--accent)" : "var(--bg-tertiary)",
                              color: isNewTab ? "#fff" : "var(--text-secondary)",
                            }}
                          >
                            New Tab
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview of menu bar */}
              <div>
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="flex items-center gap-1 p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                  <span className="text-sm font-semibold mr-4">{workspace.name || "Workspace"}</span>
                  {anchored.map((mod) => (
                    <span key={mod} className="px-2 py-1 text-xs rounded" style={{ background: "var(--bg-tertiary)" }}>
                      {APP_REGISTRY[mod]?.icon} {APP_REGISTRY[mod]?.name}
                    </span>
                  ))}
                  {newTab.length > 0 && (
                    <span className="px-2 py-1 text-xs rounded" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                      + {newTab.length} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="max-w-xl space-y-6">
              <h2 className="text-lg font-semibold">Permissions</h2>

              <div>
                <h3 className="text-sm font-medium mb-2">Allowed Roles</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                  Select which user roles can access this workspace.
                </p>
                <div className="space-y-2">
                  {["admin", "builder", "operator"].map((role) => (
                    <label key={role} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                      <input
                        type="checkbox"
                        checked={(workspace.allowed_roles || []).includes(role)}
                        onChange={() => toggleRole(role)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{role}</span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {role === "admin" && "Full platform access"}
                        {role === "builder" && "Can build apps and pipelines"}
                        {role === "operator" && "Uses operational workspaces"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Navigation Restriction</h3>
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={workspace.restrict_navigation}
                    onChange={(e) => setWorkspace((p) => ({ ...p, restrict_navigation: e.target.checked }))}
                    className="rounded"
                  />
                  <div>
                    <div className="text-sm">Restrict navigation</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Users cannot leave this workspace or access the builder interface
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
