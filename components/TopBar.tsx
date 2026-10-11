"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  IconBell,
  IconUser,
  IconLogout,
  IconSettings,
  IconMenu2,
  IconLayoutSidebar,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import NotificationModal from "@/components/notifications/NotificationModal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed, setIsMobileOpen } = useSidebar();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch unread notification count
  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(
        "https://riderr-backend.onrender.com/api/notifications/unread-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.count);
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Set up interval for real-time updates
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Handle user logout
  const handleLogout = React.useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  // Handle profile click
  const handleProfileClick = React.useCallback(() => {
    router.push("/dashboard/profile");
    setShowUserMenu(false);
  }, [router]);

  // Handle settings click
  const handleSettingsClick = React.useCallback(() => {
    router.push("/dashboard/settings");
    setShowUserMenu(false);
  }, [router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-40 h-14 border-b border-brand-hairline bg-white transition-[left] duration-200",
          isCollapsed ? "left-0 md:left-16" : "left-0 md:left-60",
        )}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          {/* Left: menu (mobile) / collapse (desktop) */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="dash-icon-btn md:hidden"
              aria-label="Open menu"
            >
              <IconMenu2 className="size-5" stroke={1.75} />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="dash-icon-btn -ml-1.5 hidden md:inline-flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <IconLayoutSidebar className="size-[18px]" stroke={1.75} />
            </button>
          </div>

          {/* Right: notifications + account */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="dash-icon-btn relative"
              aria-label="Notifications"
            >
              <IconBell className="size-[18px]" stroke={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="user-menu relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md py-1 pr-2 pl-1 transition-colors hover:bg-brand-canvas-soft"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-secondary text-xs font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-[150px] truncate text-[13px] leading-4 font-medium text-brand-ink">
                    {user?.name || "User"}
                  </span>
                  <span className="block text-xs leading-4 text-brand-ink-muted capitalize">
                    {user?.role?.replace("_", " ") || "User"}
                  </span>
                </span>
                <IconChevronDown className="hidden size-3.5 text-brand-ink-faint md:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 z-50 mt-1.5 w-56 rounded-lg border border-brand-hairline bg-white p-1 shadow-elevated">
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-medium text-brand-ink">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-brand-ink-muted">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <div className="my-1 border-t border-brand-hairline" />
                  <button
                    onClick={handleProfileClick}
                    className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-brand-ink-secondary transition-colors hover:bg-brand-canvas-soft"
                  >
                    <IconUser className="size-4 text-brand-ink-muted" stroke={1.75} />
                    My Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-brand-ink-secondary transition-colors hover:bg-brand-canvas-soft"
                  >
                    <IconSettings className="size-4 text-brand-ink-muted" stroke={1.75} />
                    Settings
                  </button>
                  <div className="my-1 border-t border-brand-hairline" />
                  <button
                    onClick={handleLogout}
                    className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <IconLogout className="size-4" stroke={1.75} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
}
