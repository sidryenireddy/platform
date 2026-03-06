"use client";

import { useState, useEffect } from "react";
import { APP_REGISTRY } from "@/types/platform";
import type { ApplicationAccess, ModuleType } from "@/types/platform";
import { api } from "@/lib/api";

const SIX_APPS: ModuleType[] = [
  "data_connection", "pipeline_builder", "ontology", "prism", "lattice", "ai_platform",
];

const ROLES = ["admin", "builder", "operator"];

export default function AccessControlPage() {
  const [accessRules, setAccessRules] = useState<ApplicationAccess[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api.access.list().then(setAccessRules).catch(() => {
      // Fallback defaults
      setAccessRules(
        SIX_APPS.map((app, i) => ({
          id: `acc-${i + 1}`,
          organization_id: "org-1",
          application_name: app,
          access_type: "everyone" as const,
          allowed_roles: ["admin", "builder", "operator"],
        }))
      );
    });
  }, []);

  const toggleRole = async (appName: string, role: string) => {
    const rule = accessRules.find((r) => r.application_name === appName);
    if (!rule) return;

    const currentRoles = rule.allowed_roles || ROLES;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    const updated = { ...rule, allowed_roles: newRoles };
    setAccessRules((prev) =>
      prev.map((r) => (r.application_name === appName ? updated : r))
    );

    setSaving(appName);
    try {
      await api.access.update(appName, updated);
    } catch { /* ignore */ }
    setSaving(null);
  };

  return (
    <div className="h-screen flex flex-col" data-theme="dark">
      <div className="h-12 flex items-center justify-between px-6 border-b shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>← Back to Platform</a>
          <span className="font-semibold">Application Access Control</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-2">Application Permissions</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Control which roles can access each application. Users without access won&apos;t see the app in the sidebar or Apps grid.
            Operators with restricted workspace access go directly to their workspace.
          </p>

          {/* Access matrix */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div
              className="grid items-center gap-4 px-4 py-3 text-xs font-semibold uppercase"
              style={{ gridTemplateColumns: "1fr repeat(3, 80px) 100px", background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              <span>Application</span>
              {ROLES.map((role) => (
                <span key={role} className="text-center capitalize">{role}</span>
              ))}
              <span className="text-center">Status</span>
            </div>

            {SIX_APPS.map((appName) => {
              const app = APP_REGISTRY[appName];
              const rule = accessRules.find((r) => r.application_name === appName);
              const roles = rule?.allowed_roles || ROLES;

              return (
                <div
                  key={appName}
                  className="grid items-center gap-4 px-4 py-3 border-t"
                  style={{ gridTemplateColumns: "1fr repeat(3, 80px) 100px", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{app.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{app.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{app.description}</div>
                    </div>
                  </div>
                  {ROLES.map((role) => (
                    <div key={role} className="flex justify-center">
                      <button
                        onClick={() => toggleRole(appName, role)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
                        style={{
                          background: roles.includes(role) ? "var(--success)" : "var(--bg-tertiary)",
                          color: roles.includes(role) ? "#fff" : "var(--text-secondary)",
                        }}
                      >
                        {roles.includes(role) ? "✓" : "—"}
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    {saving === appName ? (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Saving...</span>
                    ) : (
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: roles.length === 3 ? "var(--success)" + "22" : "var(--warning)" + "22",
                          color: roles.length === 3 ? "var(--success)" : "var(--warning)",
                        }}
                      >
                        {roles.length === 3 ? "All roles" : `${roles.length} role${roles.length !== 1 ? "s" : ""}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <h3 className="text-sm font-semibold mb-2">How Access Control Works</h3>
            <ul className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
              <li>Users with <strong>admin</strong> role see all apps and the full builder interface.</li>
              <li>Users with <strong>builder</strong> role see allowed apps in the builder sidebar.</li>
              <li>Users with <strong>operator</strong> role are directed to their assigned workspace. If <em>restrict navigation</em> is enabled on the workspace, they cannot access the builder sidebar.</li>
              <li>Removing all roles from an app effectively hides it from everyone except organization owners.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
