"use client";

import React from "react";
import {
  IconDashboard,
  IconUsers,
  IconPackage,
  IconUser,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconCreditCard,
  IconX,
  IconClipboardList,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth, useCompany, usePermissions } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { name: "Overview", icon: IconDashboard, href: "/dashboard" },
  { name: "Riders", icon: IconUsers, href: "/dashboard/riders" },
  { name: "Deliveries", icon: IconPackage, href: "/dashboard/deliveries" },
  { name: "Manual Records", icon: IconClipboardList, href: "/dashboard/manual-records" },
  { name: "Payments", icon: IconCreditCard, href: "/dashboard/payments" },
];

const bottomItems = [
  { name: "Profile", icon: IconUser, href: "/dashboard/profile" },
  { name: "Settings", icon: IconSettings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const permissions = usePermissions();

  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => {
      if (!user) return false;
      switch (item.name) {
        case "Manual Records":
          return user.role === "admin" || user.role === "company_admin";
        case "Riders":
          return permissions.canManageDrivers && (user.role === "admin" || user.role === "company_admin");
        case "Reports":
          return permissions.canViewReports;
        case "Overview":
          return permissions.canViewDashboard;
        case "Deliveries":
          return permissions.canManageDeliveries;
        case "Payments":
          return user.role === "admin" || user.role === "company_admin";
        default:
          return true;
      }
    });
  }, [user, permissions]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActiveItem = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const closeMobile = () => setIsMobileOpen(false);

  const sidebarContent = (collapsed: boolean) => (
    <>
      {/* Logo/Title Section */}
      <div className={cn("flex items-center px-6 py-5 border-b border-white/20", collapsed && "justify-center px-0")}>
        <div className="flex items-center space-x-3">
          <div className="rounded-lg">
            <Image
              src="/logo.png"
              alt="logo"
              width={collapsed ? 32 : 40}
              height={collapsed ? 32 : 40}
              className="border-none rounded-full object-cover"
            />
          </div>
          {!collapsed && (
            <h1 className="text-lg font-semibold text-white tracking-wide leading-tight">RIDERR</h1>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {filteredNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMobile}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 group relative",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              isActiveItem(item.href)
                ? "bg-white/20 text-white shadow-md border border-white/30"
                : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-sm",
            )}
          >
            {isActiveItem(item.href) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm" />
            )}
            <item.icon className={cn("transition-transform group-hover:scale-110", collapsed ? "h-6 w-6" : "h-5 w-5 mr-3")} />
            {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {item.name}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        <div className="px-4 mb-3">
          <div className="border-t border-white/20" />
        </div>

        <div className="px-4 space-y-2 mb-3">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 group relative",
                collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
                isActiveItem(item.href)
                  ? "bg-white/20 text-white shadow-md border border-white/30"
                  : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-sm",
              )}
            >
              {isActiveItem(item.href) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm" />
              )}
              <item.icon className={cn("transition-transform group-hover:scale-110", collapsed ? "h-6 w-6" : "h-5 w-5 mr-3")} />
              {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl pointer-events-none">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </div>

        <div className="px-4 mb-3">
          <div className="border-t border-white/20" />
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 group w-full relative",
              collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
              "text-white/90 hover:text-white bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 shadow-sm hover:shadow-md",
            )}
          >
            <IconLogout className={cn("transition-transform group-hover:scale-110", collapsed ? "h-6 w-6" : "h-5 w-5 mr-3")} />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex flex-col h-screen w-64 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg overflow-x-hidden transition-transform duration-300 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={closeMobile}
          className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <IconX size={20} />
        </button>
        {sidebarContent(false)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen transition-all duration-300 fixed top-0 left-0 z-30 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg overflow-hidden",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-blue-800 border-2 border-white text-white p-1.5 rounded-full z-50 hover:bg-blue-900 transition-colors shadow-lg"
        >
          {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </button>
        {sidebarContent(isCollapsed)}
      </aside>
    </>
  );
}
