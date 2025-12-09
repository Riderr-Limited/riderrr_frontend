// app/dashboard/layout.tsx
import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-6 gap-6">
      <aside className="md:col-span-1 bg-white p-4 rounded shadow h-fit">
        <div className="font-semibold mb-4">Organization</div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/dashboard"
            className="py-2 px-2 rounded hover:bg-slate-50"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/riders"
            className="py-2 px-2 rounded hover:bg-slate-50"
          >
            Riders
          </Link>
          <Link
            href="/dashboard/deliveries"
            className="py-2 px-2 rounded hover:bg-slate-50"
          >
            Deliveries
          </Link>
          <Link
            href="/dashboard/analytics"
            className="py-2 px-2 rounded hover:bg-slate-50"
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/reports"
            className="py-2 px-2 rounded hover:bg-slate-50"
          >
            Reports
          </Link>
        </nav>
      </aside>

      <section className="md:col-span-5">{children}</section>
    </div>
  );
}
