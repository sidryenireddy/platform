"use client";

import type { Notification } from "@/types/platform";
import { NOTIFICATION_TYPE_CONFIG } from "@/types/platform";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClickNotification: (notif: Notification) => void;
  onMarkAllRead: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationCenter({
  open, onClose, notifications, onClickNotification, onMarkAllRead,
}: NotificationCenterProps) {
  if (!open) return null;

  const unread = notifications.filter((n) => !n.read).length;
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute right-4 top-12 w-[400px] rounded-xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-semibold">Notifications {unread > 0 && <span className="text-xs font-normal" style={{ color: "var(--text-secondary)" }}>({unread} unread)</span>}</span>
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[450px] overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No notifications
            </div>
          ) : (
            sorted.map((n) => {
              const config = NOTIFICATION_TYPE_CONFIG[n.type] || { icon: "•", color: "var(--text-secondary)" };
              return (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b flex gap-3 items-start transition-colors cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    background: n.read ? "transparent" : "var(--bg-tertiary)",
                  }}
                  onClick={() => onClickNotification(n)}
                  onMouseEnter={(e) => {
                    if (n.read) e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    if (n.read) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: `${config.color}22`, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm truncate">{n.title}</div>
                      <div className="text-[10px] shrink-0" style={{ color: "var(--text-secondary)" }}>
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                    <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {n.message}
                    </div>
                    {n.resource_type && (
                      <div className="text-[10px] mt-1" style={{ color: "var(--accent)" }}>
                        Click to open {n.resource_type}
                      </div>
                    )}
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: "var(--accent)" }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
