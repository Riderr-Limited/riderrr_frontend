"use client";

import { IoNotificationsOutline } from "react-icons/io5";
import Link from "next/link";
import { Menu } from "lucide-react";
import Image from "next/image";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className=" text-[#1E91D6] from-[#041e2f] to-[#0f1215] bg-linear-to-b px-6 py-4 pb-1 flex items-center gap-2 justify-between relative">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Profile dropdown */}
      <div className="flex items-center gap-3 relative">
        {/* 🔔 Notifications */}
        <button className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
          <IoNotificationsOutline size={22} />

          <span className="absolute -top-1 -right-1  w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ring-2 ring-white">
            9
          </span>
        </button>

        <Link
          href={"/dashboard/profile"}
          className="flex items-center gap-3 group"
        >
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm md:text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Rider Limited
            </span>
          </div>
          <div className="relative">
            <Image
              src={"/me.jpg"}
              alt="Profile"
              width={42}
              height={42}
              className="rounded-full md:w-14 md:h-14 w-10 h-10 object-cover border-2 border-[#1E91D6]group-hover:border-brand-500 transition-all shadow-sm group-hover:shadow-md"
            />
            <div className="absolute inset-0 rounded-full bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors"></div>
          </div>
        </Link>
      </div>
    </header>
  );
}
