"use client";

import { useState } from "react";
import type { Notification } from "@/types/platform";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", user_id: "user-1", type: "sync_completed", title: "Data Sync Complete",
    message: "Customer dataset synced successfully.", read: false, created_at: new Date().toISOString(),
  },
  {
    id: "n2", user_id: "user-1", type: "build_failed", title: "Pipeline Build Failed",
    message: "ETL pipeline 'customer-enrichment' failed at step 3.", read: false, created_at: new Date().toISOString(),
  },
  {
    id: "n3", user_id: "user-1", type: "action_executed", title: "Action Completed",
    message: "Bulk update on 1,234 Customer objects completed.", read: true, created_at: new Date().toISOString(),
  },
];

const TYPE_COLORS: Record<string, string> = {
  sync_completed: "var(--success)",
  build_failed: "var(--danger)",
  action_executed: "var(--accent)",
  agent_alert: "var(--warning)",
};

export default function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute right-4 top-12 w-[380px] rounded-xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-semibold">Notifications {unread > 0 && `(${unread})`}</span>
          <button
            onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
            className="text-xs hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="px-4 py-3 border-b flex gap-3 items-start transition-colors cursor-pointer"
              style={{
                borderColor: "var(--border)",
                background: n.read ? "transparent" : "var(--bg-tertiary)",
              }}
              onClick={() => setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
            >
              <div
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ background: TYPE_COLORS[n.type] || "var(--text-secondary)" }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{n.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {n.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
