"use client";

import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LoadingScreen from "@/components/LoadingScreen";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user) {
        const allowedRoles = ["admin", "company_admin"];
        if (!allowedRoles.includes(user.role)) {
          router.push("/unauthorized");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64",
      )}>
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-auto mt-16">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-gray-600 mt-1">
              {getPageDescription(pathname, user?.name)}
            </p>
          </div>
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

// Helper function to get page title based on route
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    "/dashboard": "Dashboard Overview",
    "/dashboard/overview": "Dashboard Overview",
    "/dashboard/riders": "Riders Management",
    "/dashboard/deliveries": "Deliveries Tracking",
    "/dashboard/payments": "Payments",
    "/dashboard/profile": "My Profile",
    "/dashboard/settings": "Settings",
    "/company/profile": "Company Profile",
  };
  return routes[pathname] || "";
}

// Helper function to get page description
function getPageDescription(pathname: string, userName?: string): string {
  const descriptions: Record<string, string> = {
    "/dashboard": `Welcome back, ${userName || "User"}! Here's what's happening today.`,
    "/dashboard/overview": `Welcome back, ${userName || "User"}! Here's what's happening today.`,
    "/dashboard/riders": "Manage and monitor all riders in your fleet.",
    "/dashboard/deliveries":
      "Track all deliveries in real-time, assign riders, and monitor progress.",
    "/dashboard/payments":
      "View earnings, settlements, and payment history.",
    "/dashboard/profile":
      "Manage your personal information and account settings.",
    "/dashboard/settings":
      "Configure your account preferences and notification settings.",
    "/company/profile":
      "Manage your company information, settings, and documents.",
  };
  return descriptions[pathname] || "";
}
