"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex font-sans min-h-screen">
      {/* Fixed Sidebar for lg+ */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-60">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar (overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Sidebar panel */}
          <div className="relative z-50 w-60 ">
            <Sidebar />
          </div>

          {/* Overlay (click to close) */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Fixed Topbar */}
        <div className="sticky top-0 z-30">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Main Section (add padding-top so content is not hidden under header) */}
        <main className="flex-1 bg-[#041e2f] overflow-hidden mx-auto sm:px-6 lg:px-4 lg:pr-6 w-full ">
          {children}
        </main>
      </div>
    </div>
  );
}
