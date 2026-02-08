"use client";

import React, { useState } from "react";
import {
  IconDashboard,
  IconUsers,
  IconPackage,
  IconUser,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconBell,
  IconHelp,
  IconLogout,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth, useCompany, usePermissions } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { name: "Overview", icon: IconDashboard, href: "/dashboard" },
  { name: "Riders", icon: IconUsers, href: "/dashboard/riders" },
  { name: "Deliveries", icon: IconPackage, href: "/dashboard/deliveries" },
];

const bottomItems = [
  { name: "Profile", icon: IconUser, href: "/dashboard/profile" },
  { name: "Settings", icon: IconSettings, href: "/dashboard/settings" },
];

const utilityItems = [
  { name: "Notifications", icon: IconBell, href: "/dashboard/notifications" },
  { name: "Help & Support", icon: IconHelp, href: "/dashboard/help" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { company, isCompanyUser } = useCompany();
  const permissions = usePermissions();

  // Filter nav items based on user role/permissions
  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => {
      if (!user) return false;

      switch (item.name) {
        case "Riders":
          return (
            permissions.canManageDrivers &&
            (user.role === "admin" || user.role === "company_admin")
          );
        case "Reports":
          return permissions.canViewReports;
        case "Overview":
          return permissions.canViewDashboard;
        case "Deliveries":
          return permissions.canManageDeliveries;
        default:
          return true;
      }
    });
  }, [user, permissions]);

  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get user display name
  const userDisplayName = React.useMemo(() => {
    if (!user) return "Loading...";
    return user.name || user.email?.split("@")[0] || "User";
  }, [user]);

  // Get user role display name
  const userRoleDisplay = React.useMemo(() => {
    if (!user) return "";

    switch (user.role) {
      case "admin":
        return "Admin";
      case "company_admin":
        return "Company Admin";
      case "driver":
        return isCompanyUser ? "Company Rider" : "Rider";
      case "customer":
        return "Customer";
      default:
        return "User";
    }
  }, [user, isCompanyUser]);

  // Get company name if available
  const companyName = React.useMemo(() => {
    if (company?.name) return company.name;
    if (user?.company?.name) return user.company.name;
    return "";
  }, [company, user]);

  // Check if a nav item is active
  const isActiveItem = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 sticky top-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-blue-800 border-2 border-white text-white p-1.5 rounded-full z-50 hover:bg-blue-900 transition-colors shadow-lg"
      >
        {isCollapsed ? (
          <IconChevronRight size={18} />
        ) : (
          <IconChevronLeft size={18} />
        )}
      </button>

      {/* Logo/Title Section */}
      <div
        className={cn(
          "flex items-center px-6 py-5 border-b border-white/20",
          isCollapsed && "justify-center px-0",
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="rounded-lg">
            <Image
              src="/logo.png"
              alt="logo"
              width={isCollapsed ? 32 : 40}
              height={isCollapsed ? 32 : 40}
              className="border-none rounded-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-white tracking-wide leading-tight">
                {isCompanyUser
                  ? `${companyName || "Company"}`
                  : "RIDERR"}
              </h1>
              <p className="text-xs text-white/80 mt-0.5">
                {user?.role === "company_admin"
                  ? "Admin Panel"
                  : "Management Portal"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-4 py-3 transition-all duration-200 group relative",
              isActiveItem(item.href)
                ? "bg-blue-500/30 text-white shadow-sm border border-blue-400/50 backdrop-blur-sm"
                : "text-white/90 hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-colors",
                isCollapsed ? "mx-auto" : "mr-3"
              )}
            />
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
            {isActiveItem(item.href) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                {item.name}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="px-4">
        <div className="border-t border-white/20"></div>
      </div>

      {/* Utility Items */}
      <div className="px-4 py-4 space-y-1">
        {utilityItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-4 py-3 transition-all duration-200 group relative",
              isActiveItem(item.href)
                ? "bg-blue-500/30 text-white shadow-sm border border-blue-400/50 backdrop-blur-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-colors",
                isCollapsed ? "mx-auto" : "mr-3"
              )}
            />
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
            {isActiveItem(item.href) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                {item.name}
              </div>
            )}
          </Link>
        ))}
        {/* Profile & Settings Section */}
        <div className="border-t border-white/20">
          <div className="px-4 py-4 space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 transition-all duration-200 group relative",
                  isActiveItem(item.href)
                    ? "bg-blue-500/30 text-white shadow-sm border border-blue-400/50 backdrop-blur-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {isActiveItem(item.href) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div
            className={cn(
              "px-4 py-4 border-t border-white/20",
              isCollapsed && "flex justify-center",
            )}
          >
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden shadow-sm">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={userDisplayName}
                    className="h-full w-full object-cover"
                    width={36}
                    height={36}
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {isLoading ? "Loading..." : userDisplayName}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    {isLoading ? "" : userRoleDisplay}
                    {companyName && ` • ${companyName}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Logout Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center text-white/80 hover:text-red-200 rounded-lg px-4 py-3 hover:bg-red-500/20 transition-all duration-200 group w-full border border-white/20 hover:border-red-300/50"
          >
            <IconLogout
              className={cn("h-5 w-5 transition-colors", isCollapsed ? "mx-auto" : "mr-3")}
            />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
