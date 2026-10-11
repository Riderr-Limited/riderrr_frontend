"use client";

import React from "react";
import {
  IconDashboard,
  IconUsers,
  IconPackage,
  IconUser,
  IconSettings,
  IconLogout,
  IconCreditCard,
  IconCash,
  IconRun,
  IconClipboardList,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth, usePermissions } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { name: "Overview", icon: IconDashboard, href: "/dashboard" },
  { name: "Riders", icon: IconUsers, href: "/dashboard/riders" },
  { name: "Deliveries", icon: IconPackage, href: "/dashboard/deliveries" },
  { name: "Payments", icon: IconCreditCard, href: "/dashboard/payments" },
  { name: "Payment on Delivery", icon: IconCash, href: "/dashboard/payment-on-delivery" },
  { name: "Errand", icon: IconRun, href: "/dashboard/errand" },
  { name: "Manual Record", icon: IconClipboardList, href: "/dashboard/manual-record" },
];

const bottomItems = [
  { name: "Profile", icon: IconUser, href: "/dashboard/profile" },
  { name: "Settings", icon: IconSettings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const permissions = usePermissions();

  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => {
      if (!user) return false;
      switch (item.name) {
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
        case "Payment on Delivery":
          return user.role === "admin" || user.role === "company_admin";
        case "Errand":
          return user.role === "admin" || user.role === "company_admin";
        case "Manual Record":
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

  const itemClass = (collapsed: boolean, active = false) =>
    cn(
      "flex h-9 w-full items-center rounded-md text-sm transition-colors",
      collapsed ? "justify-center" : "gap-2.5 px-2.5",
      active
        ? "bg-black/[0.06] font-medium text-brand-ink"
        : "text-brand-ink-muted hover:bg-black/[0.04] hover:text-brand-ink",
    );

  const renderLink = (item: (typeof navItems)[number], collapsed: boolean) => {
    const active = isActiveItem(item.href);
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={closeMobile}
        title={collapsed ? item.name : undefined}
        aria-current={active ? "page" : undefined}
        className={itemClass(collapsed, active)}
      >
        <item.icon className="size-[18px] shrink-0" stroke={1.75} />
        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  const sidebarContent = (collapsed: boolean) => (
    <>
      <div className={cn("flex h-14 shrink-0 items-center", collapsed ? "justify-center" : "px-4")}>
        <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Riderr"
            width={28}
            height={28}
            className="rounded-md object-cover"
          />
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight text-brand-ink">
              Riderr
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden">
        {filteredNavItems.map((item) => renderLink(item, collapsed))}
      </nav>

      <div className="space-y-0.5 border-t border-brand-hairline px-2 py-2">
        {bottomItems.map((item) => renderLink(item, collapsed))}
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(itemClass(collapsed), "cursor-pointer hover:text-red-600")}
        >
          <IconLogout className="size-[18px] shrink-0" stroke={1.75} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-brand-hairline bg-brand-canvas-soft transition-transform duration-200 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={closeMobile}
          aria-label="Close menu"
          className="dash-icon-btn absolute top-3 right-3"
        >
          <IconX className="size-[18px]" />
        </button>
        {sidebarContent(false)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 hidden h-screen flex-col border-r border-brand-hairline bg-brand-canvas-soft transition-[width] duration-200 md:flex",
          isCollapsed ? "w-16" : "w-60",
        )}
      >
        {sidebarContent(isCollapsed)}
      </aside>
    </>
  );
}
