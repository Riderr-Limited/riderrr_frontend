"use client";

import { BikeIcon } from "lucide-react";
// import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  FaUserFriends,
  FaComments,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { GrDeliver } from "react-icons/gr";
import { MdSummarize } from "react-icons/md";

// Memoize menu items config
const menuItemsConfig = [
  { label: "Overview", icon: MdSummarize, href: "/dashboard" },

  { label: "Riders", icon: BikeIcon, href: "/dashboard/riders" },
  { label: "Deliveries", icon: GrDeliver, href: "/dashboard/deliveries" },
  // { label: 'Report', icon: FaComments, href: '/dashboard/report' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    return menuItemsConfig.map(({ label, icon: IconComponent, href }) => {
      let isActive = false;
      if (href === "/dashboard") {
        isActive = pathname === "/dashboard";
      } else {
        isActive = pathname === href || pathname.startsWith(href + "/");
      }
      return { label, IconComponent, href, isActive };
    });
  }, [pathname]);

  const isProfileActive = pathname.startsWith("/dashboard/profile");
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <aside className="w-60 from-[#041e2f] to-[#0f1215]  bg-linear-to-b flex h-screen flex-col  from-brand-400 via-brand-500 to-brand-600 shadow-2xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center pt-8 pb-4 relative z-10">
        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 ">
          {/* <Image
            width={140}
            height={140}
            src="/newlogo.png"
            alt="Logo"
            className="rounded-lg"
            priority
            loading="eager"
          /> */}
          <h2 className="text-2xl font-semibold text-[#1E91D6]">RIDERR</h2>
        </div>
      </div>

      {/* Top Menu Items */}
      <nav className="flex-1 text-[#ACC8E1] w-full text-[16px] space-y-1 px-4 mt-4 relative z-10">
        {menuItems.map(({ label, IconComponent, href, isActive }) => (
          <Link
            key={label}
            href={href}
            className={`group flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 relative
                ${
                  isActive
                    ? "bg-white/20 backdrop-blur-sm text-white shadow-lg scale-[1.02] border border-white/30"
                    : "hover:bg-white/10 text-[#1E91D6] hover:text-[#0072BB] hover:scale-[1.01]"
                }`}
          >
            <IconComponent
              className={`text-[20px] transition-transform duration-300 ${
                isActive ? "scale-110" : "group-hover:scale-110"
              }`}
            />
            <span className="font-medium">{label}</span>
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Menu Items */}
      <nav className="space-y-1 text-[#ACC8E1] w-full px-4 mb-6 relative z-10 border-t border-white/20 pt-4">
        <Link
          href="/dashboard/profile"
          className={`group flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300
            ${
              isProfileActive
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg"
                : "hover:bg-white/10 text-[#1E91D6] hover:text-[#0072BB]"
            }`}
        >
          <FaUser className="text-[20px] transition-transform duration-300 group-hover:scale-110" />
          <span className="font-medium">Profile</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className={`group flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300
            ${
              isSettingsActive
                ? "bg-white/20 backdrop-blur-sm text-white shadow-lg"
                : "hover:bg-white/10 text-[#1E91D6] hover:text-[#0072BB]"
            }`}
        >
          <FaCog className="text-[20px] transition-transform duration-300 group-hover:scale-110" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          // onClick={handleLogout}
          className="group flex items-center gap-4 w-full text-left hover:bg-red-500/20 hover:text-red-100 px-6 py-3.5 rounded-xl transition-all duration-300"
        >
          <FaSignOutAlt className="text-[20px] text-[#1E91D6] hover:text-[#0072BB] transition-transform duration-300 group-hover:scale-110" />
          <span className="font-medium text-[#1E91D6] hover:text-[#0072BB]">
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}
