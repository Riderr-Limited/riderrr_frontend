"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconBell,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconPackage,
  IconUser,
  IconCash,
  IconX,
  IconChecklist,
} from "@tabler/icons-react";
//import { formatDistanceToNow } from 'date-fns'

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  subType?: string;
  read: boolean;
  createdAt: string;
  data?: any;
  priority?: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const url =
        activeTab === "unread"
          ? "https://riderr-backend.onrender.com/api/notifications?unreadOnly=true"
          : "https://riderr-backend.onrender.com/api/notifications";

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data || []);
          setUnreadCount(data.pagination?.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeTab]);

  const getNotificationIcon = (type: string) => {
    const iconProps = { className: "size-[18px] text-brand-ink-muted", stroke: 1.75 };

    switch (type) {
      case "order":
        return <IconPackage {...iconProps} />;
      case "payment":
        return <IconCash {...iconProps} />;
      case "user":
        return <IconUser {...iconProps} />;
      case "alert":
        return <IconAlertCircle {...iconProps} />;
      case "task":
        return <IconChecklist {...iconProps} />;
      case "success":
        return <IconCheck {...iconProps} className="size-[18px] text-emerald-600" />;
      case "pending":
        return <IconClock {...iconProps} className="size-[18px] text-amber-600" />;
      default:
        return <IconBell {...iconProps} />;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `https://riderr-backend.onrender.com/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        "https://riderr-backend.onrender.com/api/notifications/mark-all-read",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // ... rest of your functions (deleteNotification, etc.) ...

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Position the modal as a dropdown from the bell icon */}
      <div className="absolute top-[60px] right-4 left-4 flex justify-end md:right-6 md:left-auto">
        <div
          ref={modalRef}
          className="w-full max-w-96 overflow-hidden rounded-lg border border-brand-hairline bg-white shadow-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h3 className="text-sm font-semibold text-brand-ink">
              Notifications
            </h3>
            <button
              onClick={onClose}
              className="dash-icon-btn -mr-1.5 size-7"
              aria-label="Close"
            >
              <IconX className="size-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-brand-hairline px-4" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              className={`-mb-px cursor-pointer border-b-2 pb-2 text-[13px] font-medium transition-colors ${
                activeTab === "all"
                  ? "border-brand-ink text-brand-ink"
                  : "border-transparent text-brand-ink-muted hover:text-brand-ink"
              }`}
            >
              All
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "unread"}
              onClick={() => setActiveTab("unread")}
              className={`-mb-px cursor-pointer border-b-2 pb-2 text-[13px] font-medium transition-colors ${
                activeTab === "unread"
                  ? "border-brand-ink text-brand-ink"
                  : "border-transparent text-brand-ink-muted hover:text-brand-ink"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="size-5 animate-spin rounded-full border-2 border-brand-hairline border-t-brand-ink-muted"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-brand-ink-muted">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-hairline">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 px-4 py-3 ${!notification.read ? "bg-brand-primary/[0.04]" : ""}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-brand-ink">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-[13px] text-brand-ink-muted">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="mt-1.5 cursor-pointer text-xs font-medium text-brand-primary hover:text-brand-primary-active"
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    {!notification.read && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-brand-hairline px-4 py-2.5">
              <button
                onClick={() => (window.location.href = "/notifications")}
                className="cursor-pointer text-[13px] font-medium text-brand-ink-secondary hover:text-brand-ink"
              >
                View all
              </button>
              <button
                onClick={markAllAsRead}
                className="cursor-pointer text-[13px] text-brand-ink-muted hover:text-brand-ink"
              >
                Mark all read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
