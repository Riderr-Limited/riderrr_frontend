"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  IconBell,
  IconSearch,
  IconUser,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import NotificationModal from "@/components/notifications/NotificationModal";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(
        "https://api.riderr.ng/api/notifications/unread-count",
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
  };

  // Set up interval for real-time updates
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      console.log("Searching for:", search);
      // Implement search functionality here
      // router.push(`/search?q=${encodeURIComponent(search)}`)
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Handle profile click
  const handleProfileClick = () => {
    router.push("/dashboard/profile");
    setShowUserMenu(false);
  };

  // Handle settings click
  const handleSettingsClick = () => {
    router.push("/dashboard/settings");
    setShowUserMenu(false);
  };

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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Left: Search Bar */}
            <div className="flex-1 max-w-xl">
              <form onSubmit={handleSearch} className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deliveries, riders, reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 font-medium"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right: Action Icons */}
            <div className="flex items-center space-x-4 ml-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <IconBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <div className="absolute top-full right-0 w-2 h-2 bg-blue-500 rounded-full opacity-0 animate-ping"></div>
              </div>

              {/* User Profile */}
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role?.replace("_", " ") || "User"}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <IconUser className="h-4 w-4 mr-3 text-gray-500" />
                        My Profile
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <IconSettings className="h-4 w-4 mr-3 text-gray-500" />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IconLogout className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
