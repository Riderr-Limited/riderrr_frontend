"use client";

import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

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
    <div className="min-h-screen bg-white text-brand-ink">
      <Sidebar />
      <div className={cn(
        "flex min-h-screen flex-col transition-[margin] duration-200",
        isCollapsed ? "md:ml-16" : "md:ml-60",
      )}>
        <TopBar />
        <main className="mt-14 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
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
